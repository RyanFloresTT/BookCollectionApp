package services

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Book{})
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}

	return db
}

func createTestUser(t *testing.T, db *gorm.DB) *models.User {
	user := &models.User{
		Auth0ID: "test-auth0-id",
		Email:   "test@example.com",
	}
	result := db.Create(user)
	assert.NoError(t, result.Error)
	return user
}

func TestGetOrCreateUser(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)

	ctx := context.Background()
	auth0ID := "test-auth0-id"

	// Test creating new user
	user, err := service.GetOrCreateUser(ctx, auth0ID)
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, auth0ID, user.Auth0ID)

	// Test getting existing user
	user2, err := service.GetOrCreateUser(ctx, auth0ID)
	assert.NoError(t, err)
	assert.NotNil(t, user2)
	assert.Equal(t, user.ID, user2.ID)
}

func TestAddBook(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	startedAt := time.Now()
	finishedAt := time.Now()
	book := models.Book{
		Title:      "Test Book",
		Author:     "Test Author",
		CoverImage: "test-cover.jpg",
		Rating:     4.5,
		PageCount:  200,
		Genre:      "Fiction",
		StartedAt:  &startedAt,
		FinishedAt: &finishedAt,
	}

	// Test adding book
	err := service.AddBook(ctx, user.Auth0ID, book)
	assert.NoError(t, err)

	// Verify book was added
	var savedBook models.Book
	err = db.Where("user_id = ? AND title = ?", user.ID, book.Title).First(&savedBook).Error
	assert.NoError(t, err)
	assert.Equal(t, book.Title, savedBook.Title)
	assert.Equal(t, book.Author, savedBook.Author)
}

func TestGetUserBooks(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Add test books
	books := []models.Book{
		{Title: "Book 1", Author: "Author 1", UserID: user.ID},
		{Title: "Book 2", Author: "Author 2", UserID: user.ID},
	}
	for _, book := range books {
		err := db.Create(&book).Error
		assert.NoError(t, err)
	}

	// Test getting user's books
	userBooks, err := service.GetUserBooks(ctx, user.Auth0ID)
	assert.NoError(t, err)
	assert.Len(t, userBooks, 2)
	assert.Equal(t, "Book 1", userBooks[0].Title)
	assert.Equal(t, "Book 2", userBooks[1].Title)
}

func TestDeleteBook(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Add a test book
	book := models.Book{
		Title:  "Delete Me",
		Author: "Test Author",
		UserID: user.ID,
	}
	err := db.Create(&book).Error
	assert.NoError(t, err)

	// Test deleting book
	err = service.DeleteBook(ctx, user.Auth0ID, book.ID)
	assert.NoError(t, err)

	// Verify book was soft deleted
	var deletedBook models.Book
	err = db.Unscoped().Where("id = ?", book.ID).First(&deletedBook).Error
	assert.NoError(t, err)
	assert.NotNil(t, deletedBook.DeletedAt)
}

func TestUpdateBook(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Create initial book
	book := models.Book{
		Title:     "Original Title",
		Author:    "Original Author",
		UserID:    user.ID,
		PageCount: 100,
	}
	err := db.Create(&book).Error
	assert.NoError(t, err)

	// Update the book
	updatedBook := models.Book{
		Title:     "Updated Title",
		Author:    "Updated Author",
		PageCount: 200,
	}
	err = service.UpdateBook(ctx, user.Auth0ID, fmt.Sprintf("%d", book.ID), updatedBook)
	assert.NoError(t, err)

	// Verify updates
	var result models.Book
	err = db.First(&result, book.ID).Error
	assert.NoError(t, err)
	assert.Equal(t, "Updated Title", result.Title)
	assert.Equal(t, "Updated Author", result.Author)
	assert.Equal(t, uint(200), result.PageCount)
}

func TestFindBookByTitleAndUser(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Create a book
	book := models.Book{
		Title:  "Test Book",
		Author: "Test Author",
		UserID: user.ID,
	}
	err := db.Create(&book).Error
	assert.NoError(t, err)

	// Test finding existing book
	foundBook, err := service.FindBookByTitleAndUser(ctx, "Test Book", user.Auth0ID)
	assert.NoError(t, err)
	assert.NotNil(t, foundBook)
	assert.Equal(t, book.Title, foundBook.Title)

	// Test finding non-existent book
	foundBook, err = service.FindBookByTitleAndUser(ctx, "Non-existent Book", user.Auth0ID)
	assert.NoError(t, err)
	assert.Nil(t, foundBook)
}

func TestRestoreBook(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Create and soft delete a book
	book := models.Book{
		Title:  "Deleted Book",
		Author: "Test Author",
		UserID: user.ID,
	}
	err := db.Create(&book).Error
	assert.NoError(t, err)

	// Verify book exists before deletion
	var beforeDelete models.Book
	err = db.First(&beforeDelete, book.ID).Error
	assert.NoError(t, err)

	// Soft delete the book
	err = db.Delete(&book).Error
	assert.NoError(t, err)

	// Verify book is deleted
	err = db.First(&models.Book{}, book.ID).Error
	assert.Error(t, err) // Should error because book is soft deleted

	// Test restoring the book
	err = service.RestoreBook(ctx, fmt.Sprintf("%d", book.ID))
	assert.NoError(t, err)

	// Verify book is restored and accessible
	var restoredBook models.Book
	err = db.First(&restoredBook, book.ID).Error
	assert.NoError(t, err)
	assert.Equal(t, book.Title, restoredBook.Title)
}

func TestReadingGoal(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Test updating reading goal
	err := service.UpdateReadingGoal(ctx, user.Auth0ID, 12)
	assert.NoError(t, err)

	// Test getting reading goal
	goal, err := service.GetReadingGoal(ctx, user.Auth0ID)
	assert.NoError(t, err)
	assert.Equal(t, 12, goal)
}

func TestGetBookByID(t *testing.T) {
	db := setupTestDB(t)
	service := NewBookService(db)
	ctx := context.Background()
	user := createTestUser(t, db)

	// Create a book
	book := models.Book{
		Title:  "Test Book",
		Author: "Test Author",
		UserID: user.ID,
	}
	err := db.Create(&book).Error
	assert.NoError(t, err)

	// Test getting book by ID
	foundBook, err := service.GetBookByID(ctx, user.Auth0ID, fmt.Sprintf("%d", book.ID))
	assert.NoError(t, err)
	assert.NotNil(t, foundBook)
	assert.Equal(t, book.Title, foundBook.Title)

	// Test getting non-existent book
	foundBook, err = service.GetBookByID(ctx, user.Auth0ID, "999999")
	assert.Error(t, err)
	assert.Nil(t, foundBook)
}
