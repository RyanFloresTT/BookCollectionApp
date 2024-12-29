package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/RyanFloresTT/Book-Collection-Backend/config"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/checkout/session"
	"github.com/stripe/stripe-go/v72/customer"
	"github.com/stripe/stripe-go/v72/webhook"
)

type SubscriptionHandler struct {
	domain string
}

func NewSubscriptionHandler(domain string) *SubscriptionHandler {
	return &SubscriptionHandler{
		domain: domain,
	}
}

func (h *SubscriptionHandler) CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID    string `json:"userId"`
		UserEmail string `json:"userEmail"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Create or retrieve Stripe customer
	customerParams := &stripe.CustomerParams{
		Email: stripe.String(req.UserEmail),
	}
	customerParams.Params.Metadata = map[string]string{
		"userId": req.UserID,
	}
	cus, err := customer.New(customerParams)
	if err != nil {
		http.Error(w, "Failed to create customer", http.StatusInternalServerError)
		return
	}

	// Create checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(cus.ID),
		Mode:     stripe.String("subscription"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(config.PremiumMonthlyPrice.PriceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(h.domain + "/subscription/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(h.domain + "/subscription/cancel"),
	}

	session, err := session.New(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"sessionId": session.ID,
		"url":       session.URL,
	})
}

func (h *SubscriptionHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	const webhookSecret = "" // TODO: Add your webhook secret

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), webhookSecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "customer.subscription.created":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		// TODO: Update user's subscription status in database
	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		// TODO: Update user's subscription status in database
	}

	w.WriteHeader(http.StatusOK)
}
