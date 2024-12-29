package models

import (
	"time"
)

type Subscription struct {
	ID               string    `json:"id" gorm:"primaryKey"`
	UserID           uint      `json:"user_id"`
	User             User      `json:"user"`
	StripeCustomerID string    `json:"stripe_customer_id"`
	Status           string    `json:"status"` // active, canceled, past_due
	CurrentPeriodEnd time.Time `json:"current_period_end"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
