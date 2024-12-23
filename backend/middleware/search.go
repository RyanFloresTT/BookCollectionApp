package middleware

import "net/http"

var totalSearches int

func CountSearchMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		totalSearches += 1
		next.ServeHTTP(w, r)
	})
}
