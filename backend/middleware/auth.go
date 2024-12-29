package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

var UserIDKey = contextKey("userID")

func AuthMiddleware(next http.Handler) http.Handler {
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
				ctx := context.WithValue(r.Context(), UserIDKey, sub)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
		}

		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
	})
}
