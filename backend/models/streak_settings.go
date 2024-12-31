package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
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
		return fmt.Errorf("unsupported type for IntArray: %T", value)
	}
}

func (a IntArray) Value() (driver.Value, error) {
	if a == nil {
		return json.Marshal([]int{})
	}
	return json.Marshal(a)
}

type StreakSettings struct {
	Auth0ID      string    `json:"auth0_id" gorm:"column:auth0_id;primaryKey"`
	ExcludedDays IntArray  `json:"excluded_days" gorm:"type:jsonb;default:'[]'"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
} 