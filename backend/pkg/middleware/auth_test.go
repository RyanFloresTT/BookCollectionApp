package middleware

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}

	return db
}

func createTestHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(UserIDKey)
		if userID != nil {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(userID.(string)))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
		}
	})
}

func TestAuthMiddleware(t *testing.T) {
	db := setupTestDB(t)
	authMiddleware := NewAuthMiddleware(db)
	handler := authMiddleware.Handler(createTestHandler())

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
	}{
		{
			name:           "No Authorization Header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Bearer Format",
			authHeader:     "InvalidFormat token",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Malformed JWT",
			authHeader:     "Bearer invalid.jwt.token",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
		})
	}
}

// Mock JWT token creation for testing
func createTestToken(t *testing.T, sub string, exp time.Time) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   sub,
		"exp":   exp.Unix(),
		"email": fmt.Sprintf("%s@example.com", sub),
	})

	// Use a test signing key
	tokenString, err := token.SignedString([]byte("test-secret"))
	if err != nil {
		t.Fatalf("failed to create test token: %v", err)
	}

	return tokenString
}

func TestAuthMiddlewareWithMockJWT(t *testing.T) {
	db := setupTestDB(t)
	testSecret := []byte("test-secret")

	// Create middleware with test key function
	authMiddleware := NewTestAuthMiddleware(db, func(token *jwt.Token) (interface{}, error) {
		// Accept both RSA and HMAC for testing
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return testSecret, nil
	})

	handler := authMiddleware.Handler(createTestHandler())

	// Create a valid token
	validToken := createTestToken(t, "test-user", time.Now().Add(time.Hour))

	// Create an expired token
	expiredToken := createTestToken(t, "test-user", time.Now().Add(-time.Hour))

	tests := []struct {
		name           string
		token          string
		expectedStatus int
	}{
		{
			name:           "Valid Token",
			token:          validToken,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Expired Token",
			token:          expiredToken,
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Authorization", "Bearer "+tt.token)

			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)
		})
	}
}

func TestAuthMiddlewareUserCreation(t *testing.T) {
	db := setupTestDB(t)
	testSecret := []byte("test-secret")

	// Create middleware with test key function
	authMiddleware := NewTestAuthMiddleware(db, func(token *jwt.Token) (interface{}, error) {
		return testSecret, nil
	})

	handler := authMiddleware.Handler(createTestHandler())

	// Create a valid token
	userID := "test-user-123"
	validToken := createTestToken(t, userID, time.Now().Add(time.Hour))

	// First request should create the user
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+validToken)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	// Verify user was created in database
	var user models.User
	err := db.Where("auth0_id = ?", userID).First(&user).Error
	assert.NoError(t, err)
	assert.Equal(t, userID, user.Auth0ID)

	// Second request should use existing user
	rr = httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Verify only one user exists
	var count int64
	db.Model(&models.User{}).Where("auth0_id = ?", userID).Count(&count)
	assert.Equal(t, int64(1), count)
}
