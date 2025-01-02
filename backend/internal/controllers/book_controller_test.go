package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.Book{}, &models.StreakSettings{}, &models.GoalHistory{})
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

func TestAddBook(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	tests := []struct {
		name           string
		book           models.Book
		expectedStatus int
	}{
		{
			name: "Valid Book",
			book: models.Book{
				Title:      "Test Book",
				Author:     "Test Author",
				CoverImage: "test.jpg",
				Rating:     4.5,
				PageCount:  200,
				Genre:      "Fiction",
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "Duplicate Book",
			book: models.Book{
				Title:  "Test Book",
				Author: "Test Author",
			},
			expectedStatus: http.StatusConflict,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.book)
			req := httptest.NewRequest("POST", "/api/books/add", bytes.NewBuffer(body))
			req = req.WithContext(createTestContext(user.Auth0ID))
			rr := httptest.NewRecorder()

			controller.AddBook(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)
		})
	}
}

func TestGetUserBooks(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	// Add some test books
	books := []models.Book{
		{Title: "Book 1", Author: "Author 1", UserID: user.ID},
		{Title: "Book 2", Author: "Author 2", UserID: user.ID},
	}
	for _, book := range books {
		db.Create(&book)
	}

	req := httptest.NewRequest("GET", "/api/books/collection", nil)
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr := httptest.NewRecorder()

	controller.GetUserBooks(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var response map[string][]models.Book
	json.NewDecoder(rr.Body).Decode(&response)
	assert.Len(t, response["books"], 2)
}

func TestDeleteBook(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	// Create a book to delete
	book := models.Book{
		Title:  "Delete Me",
		Author: "Test Author",
		UserID: user.ID,
	}
	db.Create(&book)

	// Setup router for URL parameters
	r := chi.NewRouter()
	r.Delete("/api/books/{id}", controller.DeleteBook)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/books/%d", book.ID), nil)
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Verify book was deleted
	var deletedBook models.Book
	err := db.First(&deletedBook, book.ID).Error
	assert.Error(t, err) // Should error because book is soft deleted
}

func TestUpdateBook(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	// Create a book to update
	book := models.Book{
		Title:  "Original Title",
		Author: "Original Author",
		UserID: user.ID,
	}
	db.Create(&book)

	// Update the book
	updatedBook := models.Book{
		Title:  "Updated Title",
		Author: "Updated Author",
	}
	body, _ := json.Marshal(updatedBook)

	r := chi.NewRouter()
	r.Patch("/api/books/{id}", controller.UpdateBook)

	req := httptest.NewRequest("PATCH", fmt.Sprintf("/api/books/%d", book.ID), bytes.NewBuffer(body))
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Verify updates
	var result models.Book
	db.First(&result, book.ID)
	assert.Equal(t, "Updated Title", result.Title)
	assert.Equal(t, "Updated Author", result.Author)
}

func TestAddBookValidation(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	// Book with missing required fields
	invalidBook := models.Book{
		Title: "", // Required field is empty
	}
	body, _ := json.Marshal(invalidBook)
	req := httptest.NewRequest("POST", "/api/books/add", bytes.NewBuffer(body))
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr := httptest.NewRecorder()

	controller.AddBook(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestDeleteNonExistentBook(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	r := chi.NewRouter()
	r.Delete("/api/books/{id}", controller.DeleteBook)

	req := httptest.NewRequest("DELETE", "/api/books/999999", nil)
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)
	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestReadingGoal(t *testing.T) {
	db := setupTestDB(t)
	controller := NewBookController(db)
	user := createTestUser(t, db)

	// Test updating reading goal
	goal := map[string]int{"readingGoal": 12}
	body, _ := json.Marshal(goal)
	req := httptest.NewRequest("PUT", "/api/user/reading-goal", bytes.NewBuffer(body))
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr := httptest.NewRecorder()

	controller.UpdateReadingGoal(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Test getting reading goal
	req = httptest.NewRequest("GET", "/api/user/reading-goal", nil)
	req = req.WithContext(createTestContext(user.Auth0ID))
	rr = httptest.NewRecorder()

	controller.GetReadingGoal(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	var response map[string]int
	json.NewDecoder(rr.Body).Decode(&response)
	assert.Equal(t, 12, response["readingGoal"])
}

// Helper function to create a context with user ID
func createTestContext(userID string) context.Context {
	return context.WithValue(context.Background(), middleware.UserIDKey, userID)
}
