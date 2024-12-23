// backend/cmd/main.go

package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/RyanFloresTT/Book-Collection-Backend/initializers"
	"github.com/RyanFloresTT/Book-Collection-Backend/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

var (
	db  *gorm.DB
	rdb *redis.Client
	ctx = context.Background()
)

func init() {
	// Initialize Database and Redis
	db = initializers.InitializeDatabase()
	rdb = initializers.InitializeRedis().WithContext(ctx)
}

func main() {

	// Initialize Chi router
	r := chi.NewRouter()

	routes.SetupRouter(r, db, rdb)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
