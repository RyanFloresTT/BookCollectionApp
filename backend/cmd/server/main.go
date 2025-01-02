// backend/cmd/main.go

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/controllers/routes"
	"github.com/RyanFloresTT/Book-Collection-Backend/internal/initializers"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

var (
	db *gorm.DB
)

func init() {
	// Initialize Database
	db = initializers.InitializeDatabase()
}

func main() {
	// Initialize Chi router
	r := chi.NewRouter()

	routes.SetupRouter(r, db)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
