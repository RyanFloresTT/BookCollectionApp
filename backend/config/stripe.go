package config

import (
	"os"

	"github.com/stripe/stripe-go/v72"
)

const (
	PremiumPlanID = "premium_monthly"
)

func InitStripe() {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
}

type PriceConfig struct {
	PriceID      string
	ProductID    string
	PriceAmount  int64
	CurrencyCode string
}

var (
	PremiumMonthlyPrice = PriceConfig{
		PriceID:      os.Getenv("STRIPE_PREMIUM_MONTHLY_PRICE_ID"),
		ProductID:    os.Getenv("STRIPE_PREMIUM_PRODUCT_ID"),
		PriceAmount:  499, // $4.99
		CurrencyCode: "usd",
	}
)
