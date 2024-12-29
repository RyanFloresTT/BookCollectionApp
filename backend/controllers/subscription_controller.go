package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/middleware"
	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"github.com/stripe/stripe-go/v75"
	portalsession "github.com/stripe/stripe-go/v75/billingportal/session"
	checkoutsession "github.com/stripe/stripe-go/v75/checkout/session"
	"github.com/stripe/stripe-go/v75/customer"
	"github.com/stripe/stripe-go/v75/webhook"
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
		Metadata: map[string]string{
			"auth0_id": req.UserID,
		},
	}

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
		SuccessURL: stripe.String(os.Getenv("FRONTEND_URL") + "/stats?payment_status=success"),
		CancelURL:  stripe.String(os.Getenv("FRONTEND_URL") + "/subscription?payment_status=cancelled"),
	}

	s, err := checkoutsession.New(params)
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
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	fmt.Printf("Webhook - Raw payload received: %s\n", string(payload))

	signatureHeader := r.Header.Get("Stripe-Signature")
	fmt.Printf("Webhook - Stripe signature header: %s\n", signatureHeader)

	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if webhookSecret == "" {
		fmt.Printf("Webhook - Error: STRIPE_WEBHOOK_SECRET is not set\n")
		http.Error(w, "Webhook secret is not configured", http.StatusInternalServerError)
		return
	}

	// Use ConstructEventWithOptions to ignore API version mismatch
	event, err := webhook.ConstructEventWithOptions(
		payload, signatureHeader, webhookSecret,
		webhook.ConstructEventOptions{
			IgnoreAPIVersionMismatch: true,
		},
	)
	if err != nil {
		fmt.Printf("Error constructing webhook event: %v\n", err)
		fmt.Printf("Webhook - Stripe signature header: %s\n", r.Header.Get("Stripe-Signature"))
		http.Error(w, fmt.Sprintf("Error verifying webhook signature: %v", err), http.StatusBadRequest)
		return
	}

	fmt.Printf("Webhook - Received event type: %s\n", event.Type)

	switch event.Type {
	case "customer.subscription.created", "customer.subscription.updated":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			fmt.Printf("Error parsing subscription data: %v\n", err)
			http.Error(w, fmt.Sprintf("Error parsing webhook JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Get full customer details
		cus, err := customer.Get(subscription.Customer.ID, nil)
		if err != nil {
			fmt.Printf("Error getting customer details: %v\n", err)
			http.Error(w, "Error getting customer details", http.StatusInternalServerError)
			return
		}

		auth0ID := cus.Metadata["auth0_id"]
		fmt.Printf("Webhook - Customer details: ID=%s, Email=%s, Metadata=%v\n",
			cus.ID, cus.Email, cus.Metadata)
		fmt.Printf("Webhook - Processing subscription for auth0_id: %s\n", auth0ID)

		var user models.User
		if err := sc.DB.Where("auth0_id = ?", auth0ID).First(&user).Error; err != nil {
			fmt.Printf("Webhook - Error finding user: %v\n", err)
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		// Save the Stripe Customer ID to the user
		if err := sc.DB.Model(&user).Update("stripe_customer_id", subscription.Customer.ID).Error; err != nil {
			fmt.Printf("Webhook - Error updating user's Stripe Customer ID: %v\n", err)
			http.Error(w, "Error updating user", http.StatusInternalServerError)
			return
		}

		fmt.Printf("Webhook - Found user with ID: %d\n", user.ID)

		// Check for existing subscription
		var existingSub models.Subscription
		err = sc.DB.Where("user_id = ?", user.ID).First(&existingSub).Error
		if err != nil && err != gorm.ErrRecordNotFound {
			fmt.Printf("Webhook - Error checking existing subscription: %v\n", err)
			http.Error(w, "Error checking subscription", http.StatusInternalServerError)
			return
		}

		sub := models.Subscription{
			ID:               subscription.ID,
			UserID:           user.ID,
			StripeCustomerID: subscription.Customer.ID,
			Status:           string(subscription.Status),
			CurrentPeriodEnd: time.Unix(subscription.CurrentPeriodEnd, 0),
		}

		// If subscription exists, update it, otherwise create new
		if err == gorm.ErrRecordNotFound {
			fmt.Printf("Webhook - Creating new subscription\n")
			if err := sc.DB.Create(&sub).Error; err != nil {
				fmt.Printf("Webhook - Error creating subscription: %v\n", err)
				http.Error(w, "Error creating subscription", http.StatusInternalServerError)
				return
			}
		} else {
			fmt.Printf("Webhook - Updating existing subscription\n")
			if err := sc.DB.Model(&models.Subscription{}).
				Where("user_id = ?", user.ID).
				Updates(sub).Error; err != nil {
				fmt.Printf("Webhook - Error updating subscription: %v\n", err)
				http.Error(w, "Error updating subscription", http.StatusInternalServerError)
				return
			}
		}

		fmt.Printf("Webhook - Successfully saved subscription: ID=%s, Status=%s\n", sub.ID, sub.Status)

	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			fmt.Printf("Error parsing deleted subscription data: %v\n", err)
			http.Error(w, fmt.Sprintf("Error parsing webhook JSON: %v", err), http.StatusBadRequest)
			return
		}

		fmt.Printf("Webhook - Processing subscription deletion: ID=%s\n", subscription.ID)

		if err := sc.DB.Model(&models.Subscription{}).
			Where("id = ?", subscription.ID).
			Update("status", "canceled").Error; err != nil {
			fmt.Printf("Webhook - Error updating subscription status: %v\n", err)
			http.Error(w, "Error updating subscription", http.StatusInternalServerError)
			return
		}

		fmt.Printf("Webhook - Successfully marked subscription as canceled: %s\n", subscription.ID)
	}

	w.WriteHeader(http.StatusOK)
}

func (sc *SubscriptionController) GetSubscriptionStatus(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	fmt.Printf("GetSubscriptionStatus - Auth check - UserID from context: %v, ok: %v\n", userID, ok)

	if !ok || userID == "" {
		fmt.Printf("GetSubscriptionStatus - No valid user ID in context\n")
		// Return free status for unauthenticated users
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "free",
		})
		return
	}

	var user models.User
	if err := sc.DB.Where("auth0_id = ?", userID).First(&user).Error; err != nil {
		fmt.Printf("GetSubscriptionStatus - Error finding user with auth0_id %s: %v\n", userID, err)
		if err == gorm.ErrRecordNotFound {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status": "free",
			})
			return
		}
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}

	fmt.Printf("GetSubscriptionStatus - Found user with ID: %d\n", user.ID)

	var subscription models.Subscription
	if err := sc.DB.Where("user_id = ?", user.ID).First(&subscription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create a default free subscription
			subscription = models.Subscription{
				UserID: user.ID,
				Status: "free",
				// Set current period end to a far future date for free tier
				CurrentPeriodEnd: time.Now().AddDate(100, 0, 0), // 100 years in the future
			}

			if err := sc.DB.Create(&subscription).Error; err != nil {
				fmt.Printf("GetSubscriptionStatus - Error creating default subscription: %v\n", err)
				http.Error(w, "Error creating subscription", http.StatusInternalServerError)
				return
			}
			fmt.Printf("GetSubscriptionStatus - Created default free subscription for user %d\n", user.ID)

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status":       "free",
				"subscription": subscription,
			})
			return
		}
		http.Error(w, "Error fetching subscription", http.StatusInternalServerError)
		return
	}

	fmt.Printf("GetSubscriptionStatus - Found subscription: ID=%s, Status=%s, Expires=%v, StripeCustomerID=%s\n",
		subscription.ID, subscription.Status, subscription.CurrentPeriodEnd, subscription.StripeCustomerID)

	// Check if subscription is active and not expired
	if subscription.Status == "active" && subscription.CurrentPeriodEnd.After(time.Now()) {
		fmt.Printf("GetSubscriptionStatus - Subscription is active and not expired\n")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "active",
			"subscription": subscription,
		})
		return
	}

	fmt.Printf("GetSubscriptionStatus - Subscription is not active or has expired\n")
	// Return free status for inactive or expired subscriptions
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "free",
		"subscription": subscription,
	})
}

// CreatePortalSession creates a Stripe Customer Portal session
func (sc *SubscriptionController) CreatePortalSession(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Get customer ID for the user
	var user models.User
	if err := sc.DB.Where("auth0_id = ?", userID).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	fmt.Printf("Found user: ID=%d, Auth0ID=%s, StripeCustomerID=%s\n", user.ID, user.Auth0ID, user.StripeCustomerID)

	// If no StripeCustomerID in user table, check subscription table
	var customerID string
	if user.StripeCustomerID == "" {
		var subscription models.Subscription
		if err := sc.DB.Where("user_id = ?", user.ID).First(&subscription).Error; err != nil {
			fmt.Printf("Error finding subscription: %v\n", err)
			http.Error(w, "No subscription found for user", http.StatusBadRequest)
			return
		}
		customerID = subscription.StripeCustomerID

		// Update the user's StripeCustomerID while we're here
		if err := sc.DB.Model(&user).Update("stripe_customer_id", customerID).Error; err != nil {
			fmt.Printf("Error updating user's StripeCustomerID: %v\n", err)
			// Don't return error, just log it
		}
	} else {
		customerID = user.StripeCustomerID
	}

	fmt.Printf("Using StripeCustomerID: %s\n", customerID)

	if customerID == "" {
		http.Error(w, "No subscription found for user", http.StatusBadRequest)
		return
	}

	// Create return URL
	returnURL := os.Getenv("FRONTEND_URL")
	if returnURL == "" {
		returnURL = "http://localhost:5000"
	}

	// Create the portal session
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(returnURL),
	}
	session, err := portalsession.New(params)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating portal session: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the portal URL
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": session.URL,
	})
}
