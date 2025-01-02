package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"github.com/stripe/stripe-go/v75"
	portalsession "github.com/stripe/stripe-go/v75/billingportal/session"
	checkoutsession "github.com/stripe/stripe-go/v75/checkout/session"
	"github.com/stripe/stripe-go/v75/customer"
	"github.com/stripe/stripe-go/v75/webhook"
	"gorm.io/gorm"
)

type StripeClient interface {
	CreateCustomer(params *stripe.CustomerParams) (*stripe.Customer, error)
	CreateCheckoutSession(params *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error)
	CreatePortalSession(params *stripe.BillingPortalSessionParams) (*stripe.BillingPortalSession, error)
	ConstructWebhookEvent(payload []byte, header string, secret string) (stripe.Event, error)
	GetCustomer(id string, params *stripe.CustomerParams) (*stripe.Customer, error)
}

type DefaultStripeClient struct{}

func (c *DefaultStripeClient) CreateCustomer(params *stripe.CustomerParams) (*stripe.Customer, error) {
	return customer.New(params)
}

func (c *DefaultStripeClient) CreateCheckoutSession(params *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error) {
	return checkoutsession.New(params)
}

func (c *DefaultStripeClient) CreatePortalSession(params *stripe.BillingPortalSessionParams) (*stripe.BillingPortalSession, error) {
	return portalsession.New(params)
}

func (c *DefaultStripeClient) ConstructWebhookEvent(payload []byte, header string, secret string) (stripe.Event, error) {
	return webhook.ConstructEventWithOptions(payload, header, secret, webhook.ConstructEventOptions{
		IgnoreAPIVersionMismatch: true,
	})
}

func (c *DefaultStripeClient) GetCustomer(id string, params *stripe.CustomerParams) (*stripe.Customer, error) {
	return customer.Get(id, params)
}

type SubscriptionController struct {
	DB           *gorm.DB
	StripeClient StripeClient
}

func NewSubscriptionController(db *gorm.DB) *SubscriptionController {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	return &SubscriptionController{
		DB:           db,
		StripeClient: &DefaultStripeClient{},
	}
}

func (sc *SubscriptionController) CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var req struct {
		UserID    string `json:"userId"`
		UserEmail string `json:"userEmail"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user from database
	var user models.User
	result := sc.DB.Where("auth0_id = ?", req.UserID).First(&user)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Update user's email if it's different
	if user.Email != req.UserEmail {
		user.Email = req.UserEmail
		if err := sc.DB.Save(&user).Error; err != nil {
			fmt.Printf("Failed to update user email: %v\n", err)
			// Continue anyway since we have the email for Stripe
		}
	}

	// Create Stripe checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: nil, // We'll create or get the customer first
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

	// Create or retrieve Stripe customer
	customerParams := &stripe.CustomerParams{
		Email: stripe.String(req.UserEmail),
		Metadata: map[string]string{
			"auth0_id": req.UserID,
		},
	}

	cus, err := sc.StripeClient.CreateCustomer(customerParams)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating customer: %v", err), http.StatusInternalServerError)
		return
	}

	// Set the customer on the checkout session
	params.Customer = stripe.String(cus.ID)

	// Create the session
	session, err := sc.StripeClient.CreateCheckoutSession(params)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating checkout session: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the session URL
	json.NewEncoder(w).Encode(map[string]string{
		"url": session.URL,
	})
}

func (sc *SubscriptionController) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Printf("Webhook - Error reading request body: %v\n", err)
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	signatureHeader := r.Header.Get("Stripe-Signature")
	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if webhookSecret == "" {
		fmt.Printf("Webhook - Error: STRIPE_WEBHOOK_SECRET is empty\n")
		http.Error(w, "Webhook secret is not configured", http.StatusInternalServerError)
		return
	}

	event, err := sc.StripeClient.ConstructWebhookEvent(payload, signatureHeader, webhookSecret)
	if err != nil {
		fmt.Printf("Webhook - Error constructing event: %v\n", err)
		http.Error(w, fmt.Sprintf("Error verifying webhook signature: %v", err), http.StatusBadRequest)
		return
	}

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
		cus, err := sc.StripeClient.GetCustomer(subscription.Customer.ID, nil)
		if err != nil {
			fmt.Printf("Error getting customer details: %v\n", err)
			http.Error(w, "Error getting customer details", http.StatusInternalServerError)
			return
		}

		auth0ID := cus.Metadata["auth0_id"]
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

		// Check for existing subscription
		var existingSub models.Subscription
		err = sc.DB.Where("user_id = ?", user.ID).First(&existingSub).Error
		if err != nil && err != gorm.ErrRecordNotFound {
			fmt.Printf("Webhook - Error checking existing subscription: %v\n", err)
			http.Error(w, "Error checking subscription", http.StatusInternalServerError)
			return
		}

		// Only update if the new status is "better" than the current one
		shouldUpdate := true
		if err != gorm.ErrRecordNotFound {
			statusPriority := map[string]int{
				"incomplete": 0,
				"incomplete_expired": 0,
				"past_due": 1,
				"canceled": 1,
				"active": 2,
			}

			newPriority := statusPriority[string(subscription.Status)]
			currentPriority := statusPriority[existingSub.Status]
			shouldUpdate = newPriority >= currentPriority
		}

		if shouldUpdate {
			sub := models.Subscription{
				ID:               subscription.ID,
				UserID:           user.ID,
				StripeCustomerID: subscription.Customer.ID,
				Status:           string(subscription.Status),
				CurrentPeriodEnd: time.Unix(subscription.CurrentPeriodEnd, 0),
			}

			if err == gorm.ErrRecordNotFound {
				if err := sc.DB.Create(&sub).Error; err != nil {
					fmt.Printf("Webhook - Error creating subscription: %v\n", err)
					http.Error(w, "Error creating subscription", http.StatusInternalServerError)
					return
				}
			} else {
				if err := sc.DB.Model(&models.Subscription{}).
					Where("user_id = ?", user.ID).
					Updates(sub).Error; err != nil {
					fmt.Printf("Webhook - Error updating subscription: %v\n", err)
					http.Error(w, "Error updating subscription", http.StatusInternalServerError)
					return
				}
			}
		}

	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			fmt.Printf("Error parsing deleted subscription data: %v\n", err)
			http.Error(w, fmt.Sprintf("Error parsing webhook JSON: %v", err), http.StatusBadRequest)
			return
		}

		if err := sc.DB.Model(&models.Subscription{}).
			Where("id = ?", subscription.ID).
			Update("status", "canceled").Error; err != nil {
			fmt.Printf("Webhook - Error updating subscription status: %v\n", err)
			http.Error(w, "Error updating subscription", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (sc *SubscriptionController) GetSubscriptionStatus(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok || userID == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "free",
		})
		return
	}

	var user models.User
	if err := sc.DB.Where("auth0_id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status": "free",
			})
			return
		}
		fmt.Printf("GetSubscriptionStatus - Error finding user: %v\n", err)
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}

	var subscription models.Subscription
	if err := sc.DB.Where("user_id = ?", user.ID).First(&subscription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			subscription = models.Subscription{
				ID:               fmt.Sprintf("free_%d_%s", user.ID, time.Now().Format("20060102150405")),
				UserID:           user.ID,
				Status:           "free",
				CurrentPeriodEnd: time.Now().AddDate(100, 0, 0),
			}

			if err := sc.DB.Create(&subscription).Error; err != nil {
				fmt.Printf("GetSubscriptionStatus - Error creating default subscription: %v\n", err)
				http.Error(w, "Error creating subscription", http.StatusInternalServerError)
				return
			}

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

	if subscription.Status == "active" && subscription.CurrentPeriodEnd.After(time.Now()) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "active",
			"subscription": subscription,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "free",
		"subscription": subscription,
	})
}

// CreatePortalSession creates a Stripe Customer Portal session
func (sc *SubscriptionController) CreatePortalSession(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

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
	session, err := sc.StripeClient.CreatePortalSession(params)
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
