package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type BookService struct {
	DB  *gorm.DB
	Rdb *redis.Client
}

func NewBookService(db *gorm.DB) BookService {
	return BookService{
		DB: db,
	}
}

// SearchBooks queries Google Books API for books matching the query
func (s *BookService) SearchBooks(query string) ([]models.Book, error) {
	return s.fetchGoogleBooks(query)
}

func (s *BookService) fetchGoogleBooks(query string) ([]models.Book, error) {
	var books []models.Book
	apiKey := os.Getenv("GOOGLE_BOOKS_API_KEY")
	query = strings.ReplaceAll(query, " ", "+")

	url := fmt.Sprintf("https://www.googleapis.com/books/v1/volumes?q=%s&key=%s", query, apiKey)
	fmt.Println("Sending request to: " + url)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return books, err
	}
	defer resp.Body.Close()

	var result models.GoogleBookResponse

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return books, err
	}

	// Use a map to track books by title-author combination
	bookMap := make(map[string]models.Book)

	// Convert Google Books data to Book model
	for _, bk := range result.Items {
		if !bk.IsValid() {
			continue
		}

		book := models.Book{
			Title:      bk.VolumeInfo.Title,
			Author:     bk.VolumeInfo.Authors[0],
			CoverImage: bk.VolumeInfo.ImageLinks.Thumbnail,
			Rating:     bk.VolumeInfo.AverageRating,
			PageCount:  uint(bk.VolumeInfo.PageCount),
		}

		key := fmt.Sprintf("%s-%s", book.Title, book.Author)

		// If the book already exists in the map, keep the one with the highest rating
		existingBook, exists := bookMap[key]
		if !exists || book.Rating > existingBook.Rating {
			bookMap[key] = book
		}
	}

	// Convert map to slice
	for _, book := range bookMap {
		books = append(books, book)
	}

	return books, nil
}

func (s *BookService) fetchOpenLibraryBooks(query string) ([]models.Book, error) {
	var books []models.Book
	query = strings.ReplaceAll(query, " ", "+")
	url := fmt.Sprintf("https://openlibrary.org/search.json?q=%s&fields=key,title,author_name,cover_i,first_sentence,first_publish_year,place,time,person,ratings_average,number_of_pages_median&language=eng&limit=10&offset=0&sort=rating", query)
	fmt.Println("Sending request to: " + url)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return books, err
	}
	defer resp.Body.Close()

	var result models.OpenLibraryResponse

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return books, err
	}

	var author string

	// Convert Open Library Books data to Book model
	for _, bk := range result.Docs {

		if bk.RatingsAverage == 0 {
			continue
		}

		if len(bk.AuthorName) > 0 {
			author = bk.AuthorName[0]
		} else {
			author = "Unknown Author"
		}

		book := models.Book{
			Title:      bk.Title,
			Author:     author,
			CoverImage: fmt.Sprintf("https://covers.openlibrary.org/b/id/%v-L.jpg", bk.CoverI),
			Rating:     bk.RatingsAverage,
			PageCount:  uint(bk.NumberOfPagesMedian),
		}
		books = append(books, book)
	}

	return books, nil
}

// SearchUserBooks searches a user's personal book collection in the local database
func (s *BookService) GetUserBooks(ctx context.Context, userID string) ([]models.Book, error) {
	var user models.User

	// Preload only books without a deleted_at value
	err := s.DB.Preload("Books", "deleted_at IS NULL").Where("auth0_id = ?", userID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return user.Books, nil
}

// AddBook adds a book to the user's collection
func (s *BookService) AddBook(ctx context.Context, userID uint, book models.Book) error {
	// Set the UserID to associate the book with the user
	book.UserID = userID

	// Insert the book into the database
	err := s.DB.Create(&book).Error
	if err != nil {
		return err
	}

	return nil
}

func (s *BookService) GetOrCreateUser(ctx context.Context, auth0ID string) (*models.User, error) {
	var user models.User
	err := s.DB.Where("auth0_id = ?", auth0ID).First(&user).Error

	if err == gorm.ErrRecordNotFound {
		// Log that the user is being created
		fmt.Printf("User with auth0_id %s not found, creating a new user.\n", auth0ID)

		// Create a new user
		user = models.User{
			Auth0ID: auth0ID,
			Email:   user.Email,
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
func (s *BookService) DeleteBook(ctx context.Context, userID string, bookID string) error {
	var user models.User

	// Check if the user exists
	err := s.DB.Where("auth0_id = ?", userID).First(&user).Error
	if err != nil {
		return fmt.Errorf("failed to find user: %v", err)
	}

	// Delete the book if it belongs to the user
	err = s.DB.Where("id = ? AND user_id = ?", bookID, user.ID).Delete(&models.Book{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete book: %v", err)
	}

	return nil
}

func (s *BookService) FindBookByTitleAndUser(ctx context.Context, title string, userID uint) (*models.Book, error) {
	var book models.Book
	err := s.DB.Where("title = ? AND user_id = ?", title, userID).First(&book).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &book, nil
}

func (s *BookService) RestoreBook(ctx context.Context, bookID uint) error {
	err := s.DB.Model(&models.Book{}).Where("id = ?", bookID).Update("deleted_at", nil).Error
	if err != nil {
		return fmt.Errorf("failed to restore book: %v", err)
	}
	return nil
}
