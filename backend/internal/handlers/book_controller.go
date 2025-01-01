package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	services "github.com/RyanFloresTT/Book-Collection-Backend/internal/service"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type BookController struct {
	BookService services.BookService
}

func NewBookController(db *gorm.DB) *BookController {
	return &BookController{
		BookService: services.NewBookService(db),
	}
}

// AddBook handles POST /api/books/add
func (bc *BookController) AddBook(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title      string     `json:"title"`
		Author     string     `json:"author"`
		CoverImage string     `json:"coverImage"`
		Rating     float64    `json:"rating"`
		PageCount  uint       `json:"pageCount"`
		Genre      string     `json:"genre"`
		StartedAt  *time.Time `json:"started_at"`
		FinishedAt *time.Time `json:"finished_at"`
	}

	// Decode the request payload
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid request payload: %v", err), http.StatusBadRequest)
		fmt.Println("Error decoding payload:", err)
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Check if the book already exists in the user's collection
	existingBook, err := bc.BookService.FindBookByTitleAndUser(r.Context(), req.Title, userID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to check existing books: %v", err), http.StatusInternalServerError)
		return
	}

	if existingBook != nil {
		// Book exists: check if it has a DeletedAt date
		if existingBook.DeletedAt.Valid {
			// Restore the book by clearing the DeletedAt date
			err = bc.BookService.RestoreBook(r.Context(), fmt.Sprintf("%d", existingBook.ID))
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to restore book: %v", err), http.StatusInternalServerError)
				return
			}

			// Return a success response
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Book restored to collection",
			})
			return
		}

		// Book exists without a DeletedAt date
		http.Error(w, "This book already exists in your collection", http.StatusConflict)
		return
	}

	// Create a new book
	book := models.Book{
		Title:      req.Title,
		Author:     req.Author,
		CoverImage: req.CoverImage,
		Rating:     req.Rating,
		PageCount:  req.PageCount,
		Genre:      req.Genre,
		StartedAt:  req.StartedAt,
		FinishedAt: req.FinishedAt,
	}

	// Save the new book to the database
	err = bc.BookService.AddBook(r.Context(), userID, book)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to save book: %v", err), http.StatusInternalServerError)
		fmt.Println("Error saving book:", err)
		return
	}

	// If the book is being added as finished, record it in goal history
	if req.FinishedAt != nil {
		fmt.Printf("New book added as finished. Recording goal history for user %s\n", userID)

		// Get the user's streak settings to determine the goal interval
		var streakSettings models.StreakSettings
		if err := bc.BookService.GetDB().Where("auth0_id = ?", userID).First(&streakSettings).Error; err != nil {
			// If no settings exist, use default yearly interval
			fmt.Printf("No streak settings found, using default yearly interval\n")
			streakSettings.GoalInterval = "yearly"
		} else {
			fmt.Printf("Found streak settings with interval: %s\n", streakSettings.GoalInterval)
		}

		// Get the user's reading goal
		readingGoal, err := bc.BookService.GetReadingGoal(r.Context(), userID)
		if err != nil {
			fmt.Printf("Error getting reading goal: %v\n", err)
			readingGoal = 0
		}
		fmt.Printf("User's reading goal: %d\n", readingGoal)

		// Get the interval start date based on when the book was finished
		intervalStart := getIntervalStart(*req.FinishedAt, streakSettings.GoalInterval)
		fmt.Printf("Interval start date: %v\n", intervalStart)

		// Count books completed in this interval
		var booksInInterval int64
		var user models.User
		if err := bc.BookService.GetDB().Where("auth0_id = ?", userID).First(&user).Error; err != nil {
			fmt.Printf("Error finding user: %v\n", err)
			return
		}
		fmt.Printf("Found user with ID: %d\n", user.ID)

		// Count books finished in the same interval as this book
		if err := bc.BookService.GetDB().Model(&models.Book{}).
			Where("user_id = ? AND finished_at IS NOT NULL AND finished_at >= ? AND finished_at <= ?",
				user.ID,
				intervalStart,
				time.Date(req.FinishedAt.Year(), req.FinishedAt.Month(), req.FinishedAt.Day(), 23, 59, 59, 999999999, req.FinishedAt.Location()),
			).
			Count(&booksInInterval).Error; err != nil {
			fmt.Printf("Error counting books in interval: %v\n", err)
		}
		fmt.Printf("Found %d books completed in interval\n", booksInInterval)

		// Record the goal completion
		goalHistory := models.GoalHistory{
			Auth0ID:      userID,
			Interval:     streakSettings.GoalInterval,
			Target:       readingGoal,
			Achieved:     int(booksInInterval),
			StartDate:    intervalStart,
			EndDate:      *req.FinishedAt,
			WasCompleted: int(booksInInterval) >= readingGoal,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := bc.BookService.GetDB().Create(&goalHistory).Error; err != nil {
			fmt.Printf("Error recording goal history: %v\n", err)
		} else {
			fmt.Printf("Successfully recorded goal history: %+v\n", goalHistory)
		}
	}

	// Return a success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Book added to collection",
	})
}

// GetUserBooks handles GET /api/books/collection
func (bc *BookController) GetUserBooks(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	books, err := bc.BookService.GetUserBooks(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to fetch user books", http.StatusInternalServerError)
		fmt.Println("Error fetching user books:", err)
		return
	}

	response := map[string]interface{}{
		"books": books,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// DeleteBook handles DELETE /api/books/{id}
func (bc *BookController) DeleteBook(w http.ResponseWriter, r *http.Request) {
	// Extract the user ID from the context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Parse the book ID from the URL
	bookID := chi.URLParam(r, "id")
	if bookID == "" || bookID == "undefined" {
		http.Error(w, "Book ID is required", http.StatusBadRequest)
		return
	}

	bookIDUint, err := strconv.ParseUint(bookID, 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	fmt.Printf("Deleting book with ID: %s\n", bookID)

	// Call the service to delete the book
	err = bc.BookService.DeleteBook(r.Context(), userID, uint(bookIDUint))
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete book: %v", err), http.StatusInternalServerError)
		fmt.Println("Error deleting book:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Book deleted successfully",
	})
}

// UpdateBook handles PATCH /api/books/{id}
func (bc *BookController) UpdateBook(w http.ResponseWriter, r *http.Request) {
	// Extract the user ID from the context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Parse the book ID from the URL
	bookID := chi.URLParam(r, "id")
	if bookID == "" {
		http.Error(w, "Book ID is required", http.StatusBadRequest)
		return
	}

	// Get the existing book first
	existingBook, err := bc.BookService.GetBookByID(r.Context(), userID, bookID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch book: %v", err), http.StatusInternalServerError)
		return
	}

	// Parse request body
	var req struct {
		Title      string     `json:"title"`
		Author     string     `json:"author"`
		CoverImage string     `json:"coverImage"`
		Rating     float64    `json:"rating"`
		PageCount  uint       `json:"pageCount"`
		Genre      string     `json:"genre"`
		StartedAt  *time.Time `json:"started_at"`
		FinishedAt *time.Time `json:"finished_at"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Update the book
	book := models.Book{
		Title:      req.Title,
		Author:     req.Author,
		CoverImage: req.CoverImage,
		Rating:     req.Rating,
		PageCount:  req.PageCount,
		Genre:      req.Genre,
		StartedAt:  req.StartedAt,
		FinishedAt: req.FinishedAt,
	}

	err = bc.BookService.UpdateBook(r.Context(), userID, bookID, book)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update book: %v", err), http.StatusInternalServerError)
		return
	}

	// If the book was just finished (wasn't finished before but is now), record it in goal history
	if existingBook.FinishedAt == nil && req.FinishedAt != nil {
		fmt.Printf("Book was just finished. Recording goal history for user %s\n", userID)

		// Get the user's streak settings to determine the goal interval
		var streakSettings models.StreakSettings
		if err := bc.BookService.GetDB().Where("auth0_id = ?", userID).First(&streakSettings).Error; err != nil {
			// If no settings exist, use default yearly interval
			fmt.Printf("No streak settings found, using default yearly interval\n")
			streakSettings.GoalInterval = "yearly"
		} else {
			fmt.Printf("Found streak settings with interval: %s\n", streakSettings.GoalInterval)
		}

		// Get the user's reading goal
		readingGoal, err := bc.BookService.GetReadingGoal(r.Context(), userID)
		if err != nil {
			fmt.Printf("Error getting reading goal: %v\n", err)
			readingGoal = 0
		}
		fmt.Printf("User's reading goal: %d\n", readingGoal)

		// Get the interval start date based on when the book was finished
		intervalStart := getIntervalStart(*req.FinishedAt, streakSettings.GoalInterval)
		fmt.Printf("Interval start date: %v\n", intervalStart)

		// Count books completed in this interval
		var booksInInterval int64
		var user models.User
		if err := bc.BookService.GetDB().Where("auth0_id = ?", userID).First(&user).Error; err != nil {
			fmt.Printf("Error finding user: %v\n", err)
			return
		}
		fmt.Printf("Found user with ID: %d\n", user.ID)

		// Count books finished in the same interval as this book
		if err := bc.BookService.GetDB().Model(&models.Book{}).
			Where("user_id = ? AND finished_at IS NOT NULL AND finished_at >= ? AND finished_at <= ?",
				user.ID,
				intervalStart,
				time.Date(req.FinishedAt.Year(), req.FinishedAt.Month(), req.FinishedAt.Day(), 23, 59, 59, 999999999, req.FinishedAt.Location()),
			).
			Count(&booksInInterval).Error; err != nil {
			fmt.Printf("Error counting books in interval: %v\n", err)
		}
		fmt.Printf("Found %d books completed in interval\n", booksInInterval)

		// Record the goal completion
		goalHistory := models.GoalHistory{
			Auth0ID:      userID,
			Interval:     streakSettings.GoalInterval,
			Target:       readingGoal,
			Achieved:     int(booksInInterval),
			StartDate:    intervalStart,
			EndDate:      *req.FinishedAt,
			WasCompleted: int(booksInInterval) >= readingGoal,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := bc.BookService.GetDB().Create(&goalHistory).Error; err != nil {
			fmt.Printf("Error recording goal history: %v\n", err)
		} else {
			fmt.Printf("Successfully recorded goal history: %+v\n", goalHistory)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Book updated successfully",
	})
}

func getIntervalStart(date time.Time, interval string) time.Time {
	// Convert to UTC to ensure consistent timezone handling
	result := date.UTC()
	switch interval {
	case "daily":
		// Get start of day in UTC
		return time.Date(result.Year(), result.Month(), result.Day(), 0, 0, 0, 0, time.UTC)
	case "weekly":
		// Get start of week (Sunday) in UTC
		for result.Weekday() != time.Sunday {
			result = result.AddDate(0, 0, -1)
		}
		return time.Date(result.Year(), result.Month(), result.Day(), 0, 0, 0, 0, time.UTC)
	case "monthly":
		// Get start of month in UTC
		return time.Date(result.Year(), result.Month(), 1, 0, 0, 0, 0, time.UTC)
	case "yearly":
		// Get start of year in UTC
		return time.Date(result.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
	default:
		// Default to start of year in UTC
		return time.Date(result.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
	}
}

// UpdateReadingGoal handles PUT /api/user/reading-goal
func (bc *BookController) UpdateReadingGoal(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Parse request body
	var req struct {
		ReadingGoal int `json:"readingGoal"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Update the user's reading goal
	err := bc.BookService.UpdateReadingGoal(r.Context(), userID, req.ReadingGoal)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update reading goal: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Reading goal updated successfully",
	})
}

// GetReadingGoal handles GET /api/user/reading-goal
func (bc *BookController) GetReadingGoal(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Get the user's reading goal
	goal, err := bc.BookService.GetReadingGoal(r.Context(), userID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get reading goal: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{
		"readingGoal": goal,
	})
}
