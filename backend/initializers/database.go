package initializers

import (
	"log"
	"os"

	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitializeDatabase() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate models
	err = db.AutoMigrate(&models.Book{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate book model: %v", err)
	}
	// Auto-migrate models
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate user model: %v", err)
	}

	log.Println("Database connected and models migrated")
	return db
}

func CloseDatabase(db *gorm.DB) {
	sqlDB, err := db.DB()
	if err != nil {
		log.Printf("Error getting db from gorm: %v", err)
		return
	}
	err = sqlDB.Close()
	if err != nil {
		log.Printf("Error closing database: %v", err)
	}
}
