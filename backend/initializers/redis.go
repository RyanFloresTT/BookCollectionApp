package initializers

import (
	"log"
	"os"

	"context"

	"github.com/go-redis/redis/v8"
)

func InitializeRedis() *redis.Client {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		log.Fatal("REDIS_ADDR environment variable not set")
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis")
	return rdb
}

func CloseRedis(rdb *redis.Client) {
	err := rdb.Close()
	if err != nil {
		log.Printf("Error closing Redis: %v", err)
	}
}
