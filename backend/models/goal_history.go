package models

import (
	"time"
)

type GoalHistory struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Auth0ID      string    `json:"auth0_id" gorm:"column:auth0_id;index"`
	Interval     string    `json:"interval"`
	Target       int       `json:"target"`
	Achieved     int       `json:"achieved"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	WasCompleted bool      `json:"was_completed"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// GoalStats represents aggregated goal statistics
type GoalStats struct {
	CurrentGoalStreak  int        `json:"current_goal_streak"`
	LongestGoalStreak  int        `json:"longest_goal_streak"`
	TotalGoalsSet      int        `json:"total_goals_set"`
	TotalGoalsMet      int        `json:"total_goals_met"`
	GoalCompletionRate float64    `json:"goal_completion_rate"`
	AverageOvershoot   float64    `json:"average_overshoot"`
	BestInterval       string     `json:"best_interval"`
	LastGoalMet        *time.Time `json:"last_goal_met"`
}
