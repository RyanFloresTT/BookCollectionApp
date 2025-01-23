package routes

import (
	"net/http"
	"os"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/controllers"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	chimiddleware "github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
	"gorm.io/gorm"
)

func SetupRouter(r *chi.Mux, db *gorm.DB) {

	// Middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// Initialize CORS with development defaults
	allowedOrigins := []string{"http://localhost:5000", "http://localhost:8080"}

	// Add production URLs if environment variables are set
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	if backendURL := os.Getenv("BACKEND_URL"); backendURL != "" {
		allowedOrigins = append(allowedOrigins, backendURL)
	}

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "Accept", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
		Debug:            os.Getenv("ENV") == "development", // Enable debug only in development
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
	streakSettingsController := controllers.NewStreakSettingsController(db)
	goalHistoryController := controllers.NewGoalHistoryController(db)

	// Create auth middleware
	authMiddleware := middleware.NewAuthMiddleware(db)

	// Routes
	r.Route("/api/books", func(r chi.Router) {
		r.Use(authMiddleware.Handler)
		r.Get("/collection", bookController.GetUserBooks)
		r.Get("/recently-deleted", bookController.GetRecentlyDeletedBooks)
		r.Post("/add", bookController.AddBook)
		r.Delete("/{id}", bookController.DeleteBook)
		r.Patch("/{id}", bookController.UpdateBook)
		r.Put("/{id}/restore", bookController.RestoreBook)
	})

	// User routes
	r.Route("/api/user", func(r chi.Router) {
		r.Use(authMiddleware.Handler)
		r.Get("/reading-goal", bookController.GetReadingGoal)
		r.Put("/reading-goal", bookController.UpdateReadingGoal)

		r.Get("/streak-settings", streakSettingsController.GetStreakSettings)
		r.Post("/streak-settings", streakSettingsController.UpdateStreakSettings)

		// Goal History routes
		r.Post("/goal-history", goalHistoryController.RecordGoalCompletion)
		r.Get("/goal-stats", goalHistoryController.GetGoalStats)
	})

	// Update checkout routes to use subscription controller
	r.Route("/api/checkout", func(r chi.Router) {
		r.Post("/webhook", subscriptionController.HandleWebhook)

		// All other checkout endpoints require auth
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Handler)
			r.Post("/session", subscriptionController.CreateCheckoutSession)
			r.Post("/portal-session", subscriptionController.CreatePortalSession)
			r.Get("/subscription-status", subscriptionController.GetSubscriptionStatus)
		})
	})
}
