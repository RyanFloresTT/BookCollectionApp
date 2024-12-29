package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/middleware"
	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/services"
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

// SearchBooks handles GET /api/books/search?q=...
func (bc *BookController) SearchBooks(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Query parameter 'q' is required", http.StatusBadRequest)
		return
	}

	books, err := bc.BookService.SearchBooks(query)
	if err != nil {
		http.Error(w, "Failed to search books", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	response := map[string]interface{}{
		"results": books,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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

	// Ensure the user exists
	user, err := bc.BookService.GetOrCreateUser(r.Context(), userID)
	if err != nil {
		http.Error(w, "Failed to ensure user exists", http.StatusInternalServerError)
		fmt.Println("Error ensuring user exists:", err)
		return
	}

	// Check if the book already exists in the user's collection
	existingBook, err := bc.BookService.FindBookByTitleAndUser(r.Context(), req.Title, user.ID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to check existing books: %v", err), http.StatusInternalServerError)
		return
	}

	if existingBook != nil {
		// Book exists: check if it has a DeletedAt date
		if existingBook.DeletedAt.Valid {
			// Restore the book by clearing the DeletedAt date
			err = bc.BookService.RestoreBook(r.Context(), existingBook.ID)
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
		UserID:     user.ID,
		Genre:      req.Genre,
		StartedAt:  req.StartedAt,
		FinishedAt: req.FinishedAt,
	}

	// Save the new book to the database
	err = bc.BookService.AddBook(r.Context(), user.ID, book)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to save book: %v", err), http.StatusInternalServerError)
		fmt.Println("Error saving book:", err)
		return
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

	fmt.Printf("Deleting book with ID: %s\n", bookID)

	// Call the service to delete the book
	err := bc.BookService.DeleteBook(r.Context(), userID, bookID)
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

	err := bc.BookService.UpdateBook(r.Context(), userID, bookID, book)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update book: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Book updated successfully",
	})
}
