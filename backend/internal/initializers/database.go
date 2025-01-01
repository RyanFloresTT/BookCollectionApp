package initializers

import (
	"log"
	"os"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
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

	// Drop streak_settings table to handle type change
	if err := db.Exec("DROP TABLE IF EXISTS streak_settings").Error; err != nil {
		log.Printf("Warning: Failed to drop streak_settings table: %v", err)
	}

	// Auto-migrate models
	err = db.AutoMigrate(&models.Book{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate book model: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate user model: %v", err)
	}

	err = db.AutoMigrate(&models.Subscription{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate subscription model: %v", err)
	}

	err = db.AutoMigrate(&models.StreakSettings{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate streak settings model: %v", err)
	}

	err = db.AutoMigrate(&models.GoalHistory{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate goal history model: %v", err)
	}

	err = db.AutoMigrate(&models.GoalStats{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate goal stats model: %v", err)
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
