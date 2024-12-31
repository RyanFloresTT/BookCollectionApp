package controllers

import (
	"encoding/json"
	"net/http"
	"time"
	"fmt"

	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/middleware"
	"gorm.io/gorm"
)

type StreakSettingsController struct {
	db *gorm.DB
}

func NewStreakSettingsController(db *gorm.DB) *StreakSettingsController {
	return &StreakSettingsController{db: db}
}

func (c *StreakSettingsController) GetStreakSettings(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var settings models.StreakSettings

	// Debug: Print the userID we're searching for
	fmt.Printf("GetStreakSettings - Searching for settings with auth0_id: %s\n", userID)

	// Simplified query without ORDER BY
	if err := c.db.Where("auth0_id = ?", userID).First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			fmt.Printf("GetStreakSettings - No settings found for user %s, returning defaults\n", userID)
			// Return default settings if none exist - this is an expected case
			defaultSettings := models.StreakSettings{
					Auth0ID:      userID,
					ExcludedDays: models.IntArray{}, // Initialize as empty array
					CreatedAt:    time.Now(),
					UpdatedAt:    time.Now(),
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(defaultSettings)
			return
		}
		// Only log and return error for unexpected errors
		fmt.Printf("GetStreakSettings - Unexpected error for user %s: %v\n", userID, err)
		http.Error(w, "Error fetching streak settings", http.StatusInternalServerError)
		return
	}

	// Debug: Print the settings we found
	fmt.Printf("GetStreakSettings - Found settings for user %s: %+v\n", userID, settings)

	// Ensure ExcludedDays is never nil
	if settings.ExcludedDays == nil {
		settings.ExcludedDays = models.IntArray{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings)
}

func (c *StreakSettingsController) UpdateStreakSettings(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var input struct {
		ExcludedDays []int `json:"excluded_days"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Debug: Print the update we're trying to make
	fmt.Printf("UpdateStreakSettings - Updating settings for user %s with days: %v\n", userID, input.ExcludedDays)

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