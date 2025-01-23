package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = hardDeleteOldBooks(db)
	if err != nil {
		log.Fatalf("failed to hard delete old books: %v", err)
	}

	fmt.Println("Successfully hard deleted old books.")
}

func hardDeleteOldBooks(db *gorm.DB) error {
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	result := db.Unscoped().Where("deleted_at < ?", thirtyDaysAgo).Delete(&models.Book{})
	return result.Error
}
