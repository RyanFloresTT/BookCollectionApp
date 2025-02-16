package services

import (
	"context"
	"fmt"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"gorm.io/gorm"
)

type BookService interface {
	AddBook(ctx context.Context, userID string, book models.Book) error
	GetUserBooks(ctx context.Context, userID string) ([]models.Book, error)
	DeleteBook(ctx context.Context, userID string, bookID uint) error
	UpdateBook(ctx context.Context, userID string, bookID string, book models.Book) error
	GetOrCreateUser(ctx context.Context, auth0ID string) (*models.User, error)
	FindBookByTitleAndUser(ctx context.Context, title string, userID string) (*models.Book, error)
	RestoreBook(ctx context.Context, bookID string) error
	UpdateReadingGoal(ctx context.Context, userID string, goal int) error
	GetReadingGoal(ctx context.Context, userID string) (int, error)
	GetBookByID(ctx context.Context, userID string, bookID string) (*models.Book, error)
	GetRecentlyDeletedBooks(ctx context.Context, userID string) ([]models.Book, error)
	GetDB() *gorm.DB
}

type bookService struct {
	DB *gorm.DB
}

func NewBookService(db *gorm.DB) BookService {
	return &bookService{
		DB: db,
	}
}

func (s *bookService) GetDB() *gorm.DB {
	return s.DB
}

// SearchUserBooks searches a user's personal book collection in the local database
func (s *bookService) GetUserBooks(ctx context.Context, auth0ID string) ([]models.Book, error) {
	user, err := s.GetUserByAuth0ID(ctx, auth0ID)
	if err != nil {
		return nil, err
	}

	// Preload only books without a deleted_at value
	err = s.DB.Preload("Books", "deleted_at IS NULL").Where("auth0_id = ?", auth0ID).First(&user).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %v", err)
	}
	return user.Books, nil
}

// AddBook adds a book to the user's collection
func (s *bookService) AddBook(ctx context.Context, userID string, book models.Book) error {
	user, err := s.GetUserByAuth0ID(ctx, userID)
	if err != nil {
		return err
	}

	// Set the UserID to associate the book with the user
	book.UserID = user.ID

	// Insert the book into the database
	err = s.DB.Create(&book).Error
	if err != nil {
		return fmt.Errorf("failed to create book: %v", err)
	}

	return nil
}

// GetOrCreateUser finds or creates a user by their Auth0 ID
func (s *bookService) GetOrCreateUser(ctx context.Context, auth0ID string) (*models.User, error) {
	var user models.User
	err := s.DB.Where("auth0_id = ?", auth0ID).First(&user).Error

	if err == gorm.ErrRecordNotFound {
		// Log that the user is being created
		fmt.Printf("User with auth0_id %s not found, creating a new user.\n", auth0ID)

		// Create a new user with a default email
		user = models.User{
			Auth0ID: auth0ID,
			Email:   fmt.Sprintf("%s@example.com", auth0ID), // Default email, should be updated later
		}

		if err := s.DB.Create(&user).Error; err != nil {
			return nil, fmt.Errorf("failed to create new user: %v", err)
		}
	} else if err != nil {
		// Other errors
		return nil, fmt.Errorf("error querying for user: %v", err)
	}

	// Return the user (either found or newly created)
	return &user, nil
}

// DeleteBook removes a book from the user's collection
func (s *bookService) DeleteBook(ctx context.Context, userID string, bookID uint) error {
	user, err := s.GetUserByAuth0ID(ctx, userID)
	if err != nil {
		return err
	}

	result := s.DB.Where("id = ? AND user_id = ?", bookID, user.ID).Delete(&models.Book{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (s *bookService) FindBookByTitleAndUser(ctx context.Context, title string, userID string) (*models.Book, error) {
	user, err := s.GetUserByAuth0ID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var book models.Book
	err = s.DB.Where("title = ? AND user_id = ?", title, user.ID).First(&book).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &book, nil
}

func (s *bookService) RestoreBook(ctx context.Context, bookID string) error {
	// First find the deleted book
	var book models.Book
	if err := s.DB.Unscoped().Where("id = ?", bookID).First(&book).Error; err != nil {
		return fmt.Errorf("failed to find book: %v", err)
	}

	// Then restore it by clearing DeletedAt
	if err := s.DB.Model(&book).Unscoped().Update("deleted_at", nil).Error; err != nil {
		return fmt.Errorf("failed to restore book: %v", err)
	}

	return nil
}

// UpdateBook updates all book fields
func (s *bookService) UpdateBook(ctx context.Context, userID string, bookID string, book models.Book) error {
	user, err := s.GetUserByAuth0ID(ctx, userID)
	if err != nil {
		return err
	}

	// Update the book if it belongs to the user
	result := s.DB.Model(&models.Book{}).
		Where("id = ? AND user_id = ?", bookID, user.ID).
		Updates(map[string]interface{}{
			"title":       book.Title,
			"author":      book.Author,
			"cover_image": book.CoverImage,
			"rating":      book.Rating,
			"page_count":  book.PageCount,
			"genre":       book.Genre,
			"started_at":  book.StartedAt,
			"finished_at": book.FinishedAt,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to update book: %v", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("book not found or not owned by user")
	}

	return nil
}

// UpdateReadingGoal updates the user's reading goal
func (s *bookService) UpdateReadingGoal(ctx context.Context, auth0ID string, readingGoal int) error {
	user, err := s.GetUserByAuth0ID(ctx, auth0ID)
	if err != nil {
		return err
	}

	// Update the reading goal
	err = s.DB.Model(&user).Update("reading_goal", readingGoal).Error
	if err != nil {
		return fmt.Errorf("failed to update reading goal: %v", err)
	}

	return nil
}

// GetReadingGoal gets the user's reading goal
func (s *bookService) GetReadingGoal(ctx context.Context, auth0ID string) (int, error) {
	user, err := s.GetUserByAuth0ID(ctx, auth0ID)
	if err != nil {
		return 0, err
	}

	return user.ReadingGoal, nil
}

// GetBookByID retrieves a book by its ID and user ID
func (s *bookService) GetBookByID(ctx context.Context, userID string, bookID string) (*models.Book, error) {
	user, err := s.GetUserByAuth0ID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var book models.Book
	if err := s.DB.Where("id = ? AND user_id = ?", bookID, user.ID).First(&book).Error; err != nil {
		return nil, err
	}
	return &book, nil
}

// GetRecentlyDeletedBooks retrieves books that have been soft deleted within the last 30 days
func (s *bookService) GetRecentlyDeletedBooks(ctx context.Context, userID string) ([]models.Book, error) {
	user, err := s.GetUserByAuth0ID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var books []models.Book
	if err := s.DB.Unscoped().
		Where("user_id = ? AND deleted_at IS NOT NULL", user.ID).
		Find(&books).Error; err != nil {
		return nil, err
	}

	fmt.Printf("Service: Found %d deleted books for user %s\n", len(books), userID)
	return books, nil
}

func (s *bookService) GetUserByAuth0ID(ctx context.Context, auth0ID string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("auth0_id = ?", auth0ID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to find user: %v", err)
	}
	return &user, nil
}
