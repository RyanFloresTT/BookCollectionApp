FROM golang:1.22.4-alpine AS builder

# Set environment variables for static linking
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the Go app as a statically linked binary
RUN go build -o backend ./cmd/server/main.go

# Stage 2: Create the final image
FROM alpine:latest

# Install CA certificates and curl (required for HTTPS and health checks)
RUN apk --no-cache add ca-certificates curl

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/backend .

# Expose the port
EXPOSE 8080

# Command to run the executable
CMD ["./backend"]
