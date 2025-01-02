package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/middleware"
	"github.com/stretchr/testify/assert"
	"github.com/stripe/stripe-go/v75"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// MockStripeClient implements StripeClient interface for testing
type MockStripeClient struct{}

func (m *MockStripeClient) CreateCustomer(params *stripe.CustomerParams) (*stripe.Customer, error) {
	return &stripe.Customer{
		ID: "test_cus_123",
		Metadata: map[string]string{
			"auth0_id": params.Metadata["auth0_id"],
		},
	}, nil
}

func (m *MockStripeClient) CreateCheckoutSession(params *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error) {
	return &stripe.CheckoutSession{
		ID:  "test_cs_123",
		URL: "https://checkout.stripe.com/test",
	}, nil
}

func (m *MockStripeClient) CreatePortalSession(params *stripe.BillingPortalSessionParams) (*stripe.BillingPortalSession, error) {
	return &stripe.BillingPortalSession{
		ID:  "test_ps_123",
		URL: "https://billing.stripe.com/test",
	}, nil
}

func (m *MockStripeClient) GetCustomer(id string, params *stripe.CustomerParams) (*stripe.Customer, error) {
	return &stripe.Customer{
		ID: id,
		Metadata: map[string]string{
			"auth0_id": "test-auth0-id",
		},
		Email: "test@example.com",
	}, nil
}

func (m *MockStripeClient) ConstructWebhookEvent(payload []byte, header string, secret string) (stripe.Event, error) {
	var event struct {
		Type string                 `json:"type"`
		Data map[string]interface{} `json:"data"`
	}
	if err := json.Unmarshal(payload, &event); err != nil {
		return stripe.Event{}, err
	}

	return stripe.Event{
		Type: stripe.EventType(event.Type),
		Data: &stripe.EventData{
			Raw: payload,
		},
	}, nil
}

func setupSubscriptionTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.Subscription{})
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}

	return db
}

func createSubscriptionTestUser(t *testing.T, db *gorm.DB) *models.User {
	user := &models.User{
		Auth0ID:          "test-auth0-id",
		Email:            "test@example.com",
		StripeCustomerID: "test-customer-id",
	}
	result := db.Create(user)
	assert.NoError(t, result.Error)
	return user
}

func createTestSubscription(t *testing.T, db *gorm.DB, user *models.User, status string) *models.Subscription {
	subscription := &models.Subscription{
		ID:               "test-subscription-id",
		UserID:           user.ID,
		StripeCustomerID: "test-customer-id",
		Status:           status,
		CurrentPeriodEnd: time.Now().Add(24 * time.Hour), // expires in 24 hours
	}
	result := db.Create(subscription)
	assert.NoError(t, result.Error)
	return subscription
}

func TestCreateCheckoutSession(t *testing.T) {
	db := setupSubscriptionTestDB(t)
	controller := NewSubscriptionController(db)
	controller.StripeClient = &MockStripeClient{}

	// Set required environment variables
	os.Setenv("STRIPE_PREMIUM_PRICE_ID", "test-price-id")
	os.Setenv("FRONTEND_URL", "http://localhost:3000")
	defer func() {
		os.Unsetenv("STRIPE_PREMIUM_PRICE_ID")
		os.Unsetenv("FRONTEND_URL")
	}()

	tests := []struct {
		name           string
		payload        map[string]string
		expectedStatus int
	}{
		{
			name: "Valid Request",
			payload: map[string]string{
				"userId":    "test-auth0-id",
				"userEmail": "test@example.com",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Missing Payload",
			payload:        nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Missing Email",
			payload: map[string]string{
				"userId": "test-auth0-id",
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body []byte
			if tt.payload != nil {
				body, _ = json.Marshal(tt.payload)
			}

			req := httptest.NewRequest("POST", "/api/checkout/session", bytes.NewBuffer(body))
			rr := httptest.NewRecorder()

			controller.CreateCheckoutSession(rr, req)
			assert.Equal(t, tt.expectedStatus, rr.Code)

			if tt.expectedStatus == http.StatusOK {
				var response map[string]string
				err := json.NewDecoder(rr.Body).Decode(&response)
				assert.NoError(t, err)
				assert.Contains(t, response, "url")
				assert.Equal(t, "https://checkout.stripe.com/test", response["url"])
			}
		})
	}
}

func TestGetSubscriptionStatus(t *testing.T) {
	db := setupSubscriptionTestDB(t)
	controller := NewSubscriptionController(db)
	controller.StripeClient = &MockStripeClient{}
	user := createSubscriptionTestUser(t, db)

	tests := []struct {
		name           string
		setupAuth      bool
		subscription   *models.Subscription
		expectedStatus int
		expectedState  string
	}{
		{
			name:           "Unauthenticated User",
			setupAuth:      false,
			subscription:   nil,
			expectedStatus: http.StatusOK,
			expectedState:  "free",
		},
		{
			name:           "New User No Subscription",
			setupAuth:      true,
			subscription:   nil,
			expectedStatus: http.StatusOK,
			expectedState:  "free",
		},
		{
			name:      "Active Subscription",
			setupAuth: true,
			subscription: &models.Subscription{
				ID:               "test-sub-active",
				UserID:           1, // Will be overwritten
				StripeCustomerID: "test-customer-id",
				Status:           "active",
				CurrentPeriodEnd: time.Now().Add(24 * time.Hour),
			},
			expectedStatus: http.StatusOK,
			expectedState:  "active",
		},
		{
			name:      "Expired Subscription",
			setupAuth: true,
			subscription: &models.Subscription{
				ID:               "test-sub-expired",
				UserID:           1, // Will be overwritten
				StripeCustomerID: "test-customer-id",
				Status:           "active",
				CurrentPeriodEnd: time.Now().Add(-24 * time.Hour),
			},
			expectedStatus: http.StatusOK,
			expectedState:  "free",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clean up any existing subscriptions
			db.Where("user_id = ?", user.ID).Delete(&models.Subscription{})

			req := httptest.NewRequest("GET", "/api/checkout/subscription-status", nil)
			if tt.setupAuth {
				req = req.WithContext(context.WithValue(req.Context(), middleware.UserIDKey, user.Auth0ID))
			}

			if tt.subscription != nil {
				tt.subscription.UserID = user.ID
				err := db.Create(tt.subscription).Error
				assert.NoError(t, err)
			}

			rr := httptest.NewRecorder()
			controller.GetSubscriptionStatus(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			var response map[string]interface{}
			err := json.NewDecoder(rr.Body).Decode(&response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedState, response["status"])
		})
	}
}

func TestCreatePortalSession(t *testing.T) {
	db := setupSubscriptionTestDB(t)
	controller := NewSubscriptionController(db)
	controller.StripeClient = &MockStripeClient{}
	user := createSubscriptionTestUser(t, db)
	_ = createTestSubscription(t, db, user, "active")

	// Set frontend URL
	os.Setenv("FRONTEND_URL", "http://localhost:3000")
	defer os.Unsetenv("FRONTEND_URL")

	tests := []struct {
		name           string
		setupAuth      bool
		expectedStatus int
	}{
		{
			name:           "Authenticated User with Subscription",
			setupAuth:      true,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Unauthenticated User",
			setupAuth:      false,
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/api/checkout/portal-session", nil)
			if tt.setupAuth {
				req = req.WithContext(context.WithValue(req.Context(), middleware.UserIDKey, user.Auth0ID))
			}

			rr := httptest.NewRecorder()
			controller.CreatePortalSession(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			if tt.expectedStatus == http.StatusOK {
				var response map[string]string
				err := json.NewDecoder(rr.Body).Decode(&response)
				assert.NoError(t, err)
				assert.Contains(t, response, "url")
				assert.Equal(t, "https://billing.stripe.com/test", response["url"])
			}
		})
	}
}
