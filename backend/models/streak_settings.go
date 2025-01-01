package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type IntArray []int

func (a *IntArray) Scan(value interface{}) error {
	if value == nil {
		*a = IntArray{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		if len(v) == 0 {
			*a = IntArray{}
			return nil
		}
		return json.Unmarshal(v, a)
	case string:
		if v == "" {
			*a = IntArray{}
			return nil
		}
		return json.Unmarshal([]byte(v), a)
	default:
		return errors.New("unsupported type for IntArray")
	}
}

func (a IntArray) Value() (driver.Value, error) {
	if a == nil {
		return json.Marshal([]int{})
	}
	return json.Marshal(a)
}

type StreakSettings struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Auth0ID      string    `json:"auth0_id" gorm:"column:auth0_id;uniqueIndex"`
	ExcludedDays IntArray  `json:"excluded_days" gorm:"type:jsonb;default:'[]'"`
	GoalInterval string    `json:"goal_interval" gorm:"default:yearly"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
