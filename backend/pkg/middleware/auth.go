package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/internal/models"
	"github.com/RyanFloresTT/Book-Collection-Backend/pkg/utils"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type contextKey string

var UserIDKey = contextKey("userID")

type AuthMiddleware struct {
	DB         *gorm.DB
	KeyFunc    jwt.Keyfunc
	IsTestMode bool
}

func NewAuthMiddleware(db *gorm.DB) *AuthMiddleware {
	return &AuthMiddleware{
		DB:         db,
		IsTestMode: false,
		KeyFunc:    nil,
	}
}

func NewTestAuthMiddleware(db *gorm.DB, keyFunc jwt.Keyfunc) *AuthMiddleware {
	return &AuthMiddleware{
		DB:         db,
		IsTestMode: true,
		KeyFunc:    keyFunc,
	}
}

func (am *AuthMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			fmt.Printf("Auth Middleware - No authorization header\n")
			http.Error(w, "No authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		fmt.Printf("Auth Middleware - Token received: %s...\n", tokenString[:10])

		var keyFunc jwt.Keyfunc
		if am.IsTestMode {
			keyFunc = am.KeyFunc
		} else {
			keyFunc = func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return utils.GetSigningKey("https://dev-gpkq4zj8w5w30g80.us.auth0.com/.well-known/jwks.json", token)
			}
		}

		token, err := jwt.Parse(tokenString, keyFunc, jwt.WithTimeFunc(func() time.Time {
			return time.Now().Add(-5 * time.Minute)
		}))
		if err != nil {
			fmt.Printf("Auth Middleware - Token validation error: %v\n", err)
			http.Error(w, fmt.Sprintf("Invalid token: %v", err), http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if sub, ok := claims["sub"].(string); ok {
				// Get or create user in the database
				var user models.User
				result := am.DB.Where("auth0_id = ?", sub).First(&user)
				if result.Error == gorm.ErrRecordNotFound {
					// Ensure email is not empty
					email, _ := claims["email"].(string)
					if email == "" {
						fmt.Printf("Auth Middleware - Email is missing in token claims\n")
						http.Error(w, "Email is required", http.StatusBadRequest)
						return
					}

					// Create new user
					user = models.User{
						Auth0ID: sub,
						Email:   email,
					}
					if err := am.DB.Create(&user).Error; err != nil {
						fmt.Printf("Auth Middleware - Failed to create user: %v\n", err)
						http.Error(w, "Internal server error", http.StatusInternalServerError)
						return
					}
				} else if result.Error != nil {
					fmt.Printf("Auth Middleware - Database error: %v\n", result.Error)
					http.Error(w, "Internal server error", http.StatusInternalServerError)
					return
				}

				ctx := context.WithValue(r.Context(), UserIDKey, sub)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
		}

		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
	})
}
