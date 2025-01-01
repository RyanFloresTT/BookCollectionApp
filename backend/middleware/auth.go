package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/RyanFloresTT/Book-Collection-Backend/models"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type contextKey string

var UserIDKey = contextKey("userID")

type AuthMiddleware struct {
	DB *gorm.DB
}

func NewAuthMiddleware(db *gorm.DB) *AuthMiddleware {
	return &AuthMiddleware{
		DB: db,
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

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return GetSigningKey("https://dev-gpkq4zj8w5w30g80.us.auth0.com/.well-known/jwks.json", token)
		}, jwt.WithTimeFunc(func() time.Time {
			return time.Now().Add(-5 * time.Minute)
		}))

		if err != nil {
			fmt.Printf("Auth Middleware - Token validation error: %v\n", err)
			http.Error(w, fmt.Sprintf("Invalid token: %v", err), http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if sub, ok := claims["sub"].(string); ok {
				fmt.Printf("Auth Middleware - Successfully validated token for user: %s\n", sub)

				// Ensure user exists in database
				var user models.User
				result := am.DB.Where("auth0_id = ?", sub).First(&user)
				if result.Error == gorm.ErrRecordNotFound {
					// Create new user
					email, _ := claims["email"].(string)
					user = models.User{
						Auth0ID: sub,
						Email:   email,
					}
					if err := am.DB.Create(&user).Error; err != nil {
						fmt.Printf("Auth Middleware - Error creating user: %v\n", err)
						http.Error(w, "Error creating user", http.StatusInternalServerError)
						return
					}
				} else if result.Error != nil {
					fmt.Printf("Auth Middleware - Error checking user: %v\n", result.Error)
					http.Error(w, "Error checking user", http.StatusInternalServerError)
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
