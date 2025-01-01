package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"gorm.io/gorm"
)

type GoalHistoryController struct {
	db *gorm.DB
}

func NewGoalHistoryController(db *gorm.DB) *GoalHistoryController {
	return &GoalHistoryController{db: db}
}

// RecordGoalCompletion records the completion of a goal interval
func (c *GoalHistoryController) RecordGoalCompletion(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var input struct {
		Interval  string    `json:"interval"`
		Target    int       `json:"target"`
		Achieved  int       `json:"achieved"`
		StartDate time.Time `json:"start_date"`
		EndDate   time.Time `json:"end_date"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	history := models.GoalHistory{
		Auth0ID:      userID,
		Interval:     input.Interval,
		Target:       input.Target,
		Achieved:     input.Achieved,
		StartDate:    input.StartDate,
		EndDate:      input.EndDate,
		WasCompleted: input.Achieved >= input.Target,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := c.db.Create(&history).Error; err != nil {
		http.Error(w, "Error recording goal completion", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

// GetGoalStats calculates and returns goal statistics
func (c *GoalHistoryController) GetGoalStats(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var histories []models.GoalHistory
	if err := c.db.Where("auth0_id = ?", userID).Order("end_date desc").Find(&histories).Error; err != nil {
		http.Error(w, "Error fetching goal history", http.StatusInternalServerError)
		return
	}

	// Debug: Print the histories we found
	fmt.Printf("Found %d goal histories for user %s\n", len(histories), userID)
	for _, h := range histories {
		fmt.Printf("History: Interval=%s, Target=%d, Achieved=%d, WasCompleted=%v, EndDate=%v\n",
			h.Interval, h.Target, h.Achieved, h.WasCompleted, h.EndDate)
	}

	// Even if no history exists, return empty stats with zero values
	stats := calculateGoalStats(histories)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func calculateGoalStats(histories []models.GoalHistory) models.GoalStats {
	if len(histories) == 0 {
		return models.GoalStats{}
	}

	stats := models.GoalStats{
		TotalGoalsSet: len(histories),
	}

	// Calculate streaks and other stats
	currentStreak := 0
	longestStreak := 0
	totalMet := 0
	totalOvershoot := 0.0
	intervalStats := make(map[string]struct{ met, total int })

	// Sort histories by end date in ascending order for streak calculation
	sort.Slice(histories, func(i, j int) bool {
		return histories[i].EndDate.Before(histories[j].EndDate)
	})

	// Track the last completion date for streak calculation
	var lastCompletionDate *time.Time

	for i, h := range histories {
		// Update interval stats
		intervalStat := intervalStats[h.Interval]
		intervalStat.total++
		if h.WasCompleted {
			intervalStat.met++
			totalMet++

			// Calculate overshoot percentage when goal is met
			if h.Target > 0 {
				overshoot := float64(h.Achieved-h.Target) / float64(h.Target) * 100
				if overshoot > 0 {
					totalOvershoot += overshoot
				}
			}

			// Update streak based on interval type
			var maxGap time.Duration
			switch h.Interval {
			case "daily":
				maxGap = 24 * time.Hour
			case "weekly":
				maxGap = 7 * 24 * time.Hour
			case "monthly":
				maxGap = 31 * 24 * time.Hour
			case "yearly":
				maxGap = 365 * 24 * time.Hour
			default:
				maxGap = 7 * 24 * time.Hour
			}

			// Check if this goal completion continues the streak
			if lastCompletionDate == nil || h.EndDate.Sub(*lastCompletionDate) <= maxGap {
				currentStreak++
				if currentStreak > longestStreak {
					longestStreak = currentStreak
				}
			} else {
				currentStreak = 1
			}
			lastCompletionDate = &h.EndDate

			// Update last goal met time (most recent)
			if i == len(histories)-1 {
				stats.LastGoalMet = &h.EndDate
			}
		} else {
			currentStreak = 0
			lastCompletionDate = nil
		}
		intervalStats[h.Interval] = intervalStat
	}

	stats.CurrentGoalStreak = currentStreak
	stats.LongestGoalStreak = longestStreak
	stats.TotalGoalsMet = totalMet
	if len(histories) > 0 {
		stats.GoalCompletionRate = float64(totalMet) / float64(len(histories)) * 100
	}

	if totalMet > 0 {
		stats.AverageOvershoot = totalOvershoot / float64(totalMet)
	}

	// Find best interval
	bestCompletionRate := 0.0
	for interval, stat := range intervalStats {
		if stat.total > 0 {
			rate := float64(stat.met) / float64(stat.total) * 100
			if rate > bestCompletionRate {
				bestCompletionRate = rate
				stats.BestInterval = interval
			}
		}
	}

	return stats
}
