package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupGoalHistoryTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.GoalHistory{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

func TestRecordGoalCompletion(t *testing.T) {
	db := setupGoalHistoryTestDB(t)
	controller := NewGoalHistoryController(db)

	t.Run("Successfully records goal completion", func(t *testing.T) {
		// Create test data
		input := map[string]interface{}{
			"interval":   "daily",
			"target":     5,
			"achieved":   6,
			"start_date": time.Now().Add(-24 * time.Hour),
			"end_date":   time.Now(),
		}
		body, _ := json.Marshal(input)

		// Create request
		req := httptest.NewRequest("POST", "/api/user/goal-completion", bytes.NewBuffer(body))
		req = req.WithContext(context.WithValue(context.Background(), middleware.UserIDKey, "test-user"))
		rr := httptest.NewRecorder()

		// Call the handler
		controller.RecordGoalCompletion(rr, req)

		// Assert response
		assert.Equal(t, http.StatusOK, rr.Code)

		// Verify the record was created
		var history models.GoalHistory
		err := db.First(&history).Error
		assert.NoError(t, err)
		assert.Equal(t, "test-user", history.Auth0ID)
		assert.Equal(t, "daily", history.Interval)
		assert.Equal(t, 5, history.Target)
		assert.Equal(t, 6, history.Achieved)
		assert.True(t, history.WasCompleted)
	})

	t.Run("Handles invalid request body", func(t *testing.T) {
		// Send invalid JSON
		req := httptest.NewRequest("POST", "/api/user/goal-completion", bytes.NewBufferString("invalid json"))
		req = req.WithContext(context.WithValue(context.Background(), middleware.UserIDKey, "test-user"))
		rr := httptest.NewRecorder()

		controller.RecordGoalCompletion(rr, req)
		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})
}

func TestGetGoalStats(t *testing.T) {
	db := setupGoalHistoryTestDB(t)
	controller := NewGoalHistoryController(db)
	userID := "test-user"

	// Create test data for different scenarios
	now := time.Now()
	histories := []models.GoalHistory{
		{
			Auth0ID:      userID,
			Interval:     "daily",
			Target:       5,
			Achieved:     6,
			StartDate:    now.Add(-48 * time.Hour),
			EndDate:      now.Add(-24 * time.Hour),
			WasCompleted: true,
			CreatedAt:    now.Add(-48 * time.Hour),
			UpdatedAt:    now.Add(-48 * time.Hour),
		},
		{
			Auth0ID:      userID,
			Interval:     "daily",
			Target:       5,
			Achieved:     7,
			StartDate:    now.Add(-24 * time.Hour),
			EndDate:      now,
			WasCompleted: true,
			CreatedAt:    now.Add(-24 * time.Hour),
			UpdatedAt:    now.Add(-24 * time.Hour),
		},
		{
			Auth0ID:      userID,
			Interval:     "weekly",
			Target:       10,
			Achieved:     8,
			StartDate:    now.Add(-7 * 24 * time.Hour),
			EndDate:      now.Add(-2 * time.Hour),
			WasCompleted: false,
			CreatedAt:    now.Add(-7 * 24 * time.Hour),
			UpdatedAt:    now.Add(-7 * 24 * time.Hour),
		},
	}

	// Insert test data
	for _, h := range histories {
		err := db.Create(&h).Error
		assert.NoError(t, err)
	}

	t.Run("Successfully retrieves goal stats", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/user/goal-stats", nil)
		req = req.WithContext(context.WithValue(context.Background(), middleware.UserIDKey, userID))
		rr := httptest.NewRecorder()

		controller.GetGoalStats(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)

		var stats models.GoalStats
		err := json.NewDecoder(rr.Body).Decode(&stats)
		assert.NoError(t, err)

		// Verify stats
		assert.Equal(t, 2, stats.CurrentGoalStreak) // Two consecutive daily goals met
		assert.Equal(t, 2, stats.LongestGoalStreak)
		assert.Equal(t, 3, stats.TotalGoalsSet)
		assert.Equal(t, 2, stats.TotalGoalsMet)
		assert.InDelta(t, 66.67, stats.GoalCompletionRate, 0.01) // 2/3 * 100
		assert.Equal(t, "daily", stats.BestInterval)             // Daily has better completion rate
	})

	t.Run("Returns empty stats for user with no history", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/user/goal-stats", nil)
		req = req.WithContext(context.WithValue(context.Background(), middleware.UserIDKey, "non-existent-user"))
		rr := httptest.NewRecorder()

		controller.GetGoalStats(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)

		var stats models.GoalStats
		err := json.NewDecoder(rr.Body).Decode(&stats)
		assert.NoError(t, err)

		// Verify empty stats
		assert.Equal(t, 0, stats.CurrentGoalStreak)
		assert.Equal(t, 0, stats.LongestGoalStreak)
		assert.Equal(t, 0, stats.TotalGoalsSet)
		assert.Equal(t, 0, stats.TotalGoalsMet)
		assert.Equal(t, 0.0, stats.GoalCompletionRate)
		assert.Equal(t, "", stats.BestInterval)
	})
}
