package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"gorm.io/gorm"
)

type StreakSettingsController struct {
	db *gorm.DB
}

func NewStreakSettingsController(db *gorm.DB) *StreakSettingsController {
	return &StreakSettingsController{db: db}
}

func (c *StreakSettingsController) GetStreakSettings(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	fmt.Printf("GetStreakSettings - Searching for settings with auth0_id: %s\n", userID)

	var settings models.StreakSettings
	err := c.db.Where("auth0_id = ?", userID).First(&settings).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			fmt.Printf("GetStreakSettings - No settings found for user %s, creating defaults\n", userID)
			// Create default settings
			settings = models.StreakSettings{
				Auth0ID:      userID,
				GoalInterval: "yearly",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			}
			if err := c.db.Create(&settings).Error; err != nil {
				http.Error(w, fmt.Sprintf("Failed to create default settings: %v", err), http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, fmt.Sprintf("Failed to fetch streak settings: %v", err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings)
}

func (c *StreakSettingsController) UpdateStreakSettings(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var input struct {
		ExcludedDays []int  `json:"excluded_days"`
		GoalInterval string `json:"goal_interval"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate goal interval
	validIntervals := map[string]bool{"daily": true, "weekly": true, "monthly": true, "yearly": true}
	if input.GoalInterval != "" && !validIntervals[input.GoalInterval] {
		http.Error(w, "Invalid goal interval", http.StatusBadRequest)
		return
	}

	// Debug: Print the update we're trying to make
	fmt.Printf("UpdateStreakSettings - Updating settings for user %s with days: %v, interval: %s\n",
		userID, input.ExcludedDays, input.GoalInterval)

	// Ensure input.ExcludedDays is never nil
	if input.ExcludedDays == nil {
		input.ExcludedDays = []int{}
	}

	var settings models.StreakSettings
	// Try to find existing settings
	result := c.db.Where("auth0_id = ?", userID).Take(&settings)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		http.Error(w, "Error fetching streak settings", http.StatusInternalServerError)
		return
	}

	// Update or create settings
	settings.Auth0ID = userID
	settings.ExcludedDays = models.IntArray(input.ExcludedDays)
	if input.GoalInterval != "" {
		settings.GoalInterval = input.GoalInterval
	}
	settings.UpdatedAt = time.Now()
	if result.Error == gorm.ErrRecordNotFound {
		settings.CreatedAt = time.Now()
	}

	// Debug: Print what we're about to save
	fmt.Printf("UpdateStreakSettings - Saving settings: %+v\n", settings)

	if err := c.db.Save(&settings).Error; err != nil {
		fmt.Printf("UpdateStreakSettings - Error saving settings: %v\n", err)
		http.Error(w, "Error updating streak settings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings)
}
