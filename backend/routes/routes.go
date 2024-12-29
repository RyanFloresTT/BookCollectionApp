package routes

import (
	"net/http"
	"os"

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
	allowedOrigins := []string{"http://localhost:5000"}
	if prodURL := os.Getenv("FRONTEND_URL"); prodURL != "" {
		allowedOrigins = append(allowedOrigins, prodURL)
	}

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Accept", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,  // Maximum value not ignored by any of major browsers
		Debug:            true, // Enable debugging for testing, consider disabling in production
	})
	r.Use(corsMiddleware.Handler)

	// Enable CORS for preflight requests
	r.Options("/*", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"healthy"}`))
	})

	// Controllers
	bookController := controllers.NewBookController(db)
	subscriptionController := controllers.NewSubscriptionController(db)

	// Routes
	r.Route("/api/books", func(r chi.Router) {
		r.With(middleware.AuthMiddleware).Get("/collection", bookController.GetUserBooks)
		r.Get("/search", middleware.CountSearchMiddleware(http.HandlerFunc(bookController.SearchBooks)).ServeHTTP)
		r.With(middleware.AuthMiddleware).Post("/add", bookController.AddBook)
		r.With(middleware.AuthMiddleware).Delete("/{id}", bookController.DeleteBook)
		r.With(middleware.AuthMiddleware).Patch("/{id}", bookController.UpdateBook)
	})

	// Update checkout routes to use subscription controller
	r.Route("/api/checkout", func(r chi.Router) {
		r.With(middleware.AuthMiddleware).Post("/session", subscriptionController.CreateCheckoutSession)
		r.With(middleware.AuthMiddleware).Get("/subscription-status", subscriptionController.GetSubscriptionStatus)
		r.Post("/webhook", subscriptionController.HandleWebhook)
	})
}
