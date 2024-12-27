package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/checkout/session"
	"github.com/stripe/stripe-go/v74/customer"
	"github.com/stripe/stripe-go/v74/webhook"
	"gorm.io/gorm"
)

type SubscriptionController struct {
	DB *gorm.DB
}

func NewSubscriptionController(db *gorm.DB) *SubscriptionController {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	return &SubscriptionController{
		DB: db,
	}
}

func (sc *SubscriptionController) CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID    string `json:"userId"`
		UserEmail string `json:"userEmail"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Create or retrieve Stripe customer
	customerParams := &stripe.CustomerParams{
		Email: stripe.String(req.UserEmail),
	}
	customerParams.AddMetadata("auth0_id", req.UserID)

	cus, err := customer.New(customerParams)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating customer: %v", err), http.StatusInternalServerError)
		return
	}

	// Create checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(cus.ID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(os.Getenv("STRIPE_PREMIUM_PRICE_ID")),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(os.Getenv("FRONTEND_URL") + "/settings?subscription=success"),
		CancelURL:  stripe.String(os.Getenv("FRONTEND_URL") + "/settings?subscription=canceled"),
	}

	s, err := session.New(params)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating checkout session: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"url": s.URL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (sc *SubscriptionController) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	const MaxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error reading request body: %v", err), http.StatusServiceUnavailable)
		return
	}

	event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if err != nil {
		http.Error(w, fmt.Sprintf("Error verifying webhook signature: %v", err), http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "customer.subscription.created", "customer.subscription.updated":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error parsing webhook JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Update subscription in database
		auth0ID := subscription.Customer.Metadata["auth0_id"]
		var user models.User
		if err := sc.DB.Where("auth0_id = ?", auth0ID).First(&user).Error; err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		sub := models.Subscription{
			ID:               subscription.ID,
			UserID:           user.ID,
			StripeCustomerID: subscription.Customer.ID,
			Status:           string(subscription.Status),
			CurrentPeriodEnd: time.Unix(subscription.CurrentPeriodEnd, 0),
		}

		if err := sc.DB.Save(&sub).Error; err != nil {
			http.Error(w, "Error saving subscription", http.StatusInternalServerError)
			return
		}

	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error parsing webhook JSON: %v", err), http.StatusBadRequest)
			return
		}

		if err := sc.DB.Model(&models.Subscription{}).
			Where("id = ?", subscription.ID).
			Update("status", "canceled").Error; err != nil {
			http.Error(w, "Error updating subscription", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (sc *SubscriptionController) GetSubscriptionStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)

	var user models.User
	if err := sc.DB.Where("auth0_id = ?", userID).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	var subscription models.Subscription
	if err := sc.DB.Where("user_id = ?", user.ID).First(&subscription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status": "free",
			})
			return
		}
		http.Error(w, "Error fetching subscription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subscription)
}
