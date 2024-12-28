package middleware

import (
    "context"
    "net/http"
    "net/http/httptest"
    "time"
    "github.com/go-redis/redis/v8"
)

var rdb *redis.Client

func InitRedis(redisURL string) {
    opt, err := redis.ParseURL(redisURL)
    if err != nil {
        panic(err)
    }
    rdb = redis.NewClient(opt)
}

func CacheMiddleware(ttl time.Duration) func(next http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            userID := r.Context().Value("userID").(string)
            cacheKey := "books:" + userID

            // Try to get from cache
            val, err := rdb.Get(context.Background(), cacheKey).Result()
            if err == nil {
                w.Header().Set("Content-Type", "application/json")
                w.Write([]byte(val))
                return
            }

            // If not in cache, capture the response
            rec := httptest.NewRecorder()
            next.ServeHTTP(rec, r)

            // Store in cache
            if rec.Code == http.StatusOK {
                rdb.Set(context.Background(), cacheKey, rec.Body.String(), ttl)
            }

            // Copy response to original writer
            for k, v := range rec.Header() {
                w.Header()[k] = v
            }
            w.WriteHeader(rec.Code)
            w.Write(rec.Body.Bytes())
        })
    }
}

func InvalidateCache(userID string) {
    rdb.Del(context.Background(), "books:"+userID)
} 