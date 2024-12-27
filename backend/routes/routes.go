package routes

import (
	"net/http"

	"github.com/RyanFloresTT/Book-Collection-Backend/controllers"
	"github.com/RyanFloresTT/Book-Collection-Backend/middleware"
	chimiddleware "github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
	"gorm.io/gorm"
)

func SetupRouter(r *chi.Mux, db *gorm.DB) {

	// Middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// Initialize CORS
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	r.Use(corsMiddleware.Handler)

	// Controllers
	bookController := controllers.NewBookController(db)

	// Routes
	r.Route("/api/books", func(r chi.Router) {
		r.With(middleware.AuthMiddleware).Get("/collection", bookController.GetUserBooks)
		r.Get("/search", middleware.CountSearchMiddleware(http.HandlerFunc(bookController.SearchBooks)).ServeHTTP)
		r.With(middleware.AuthMiddleware).Post("/add", bookController.AddBook)
		r.With(middleware.AuthMiddleware).Delete("/{id}", bookController.DeleteBook)
		r.With(middleware.AuthMiddleware).Patch("/{id}", bookController.UpdateBook)
	})

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
}
