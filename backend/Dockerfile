# Stage 1: Build the Go application
FROM golang:1.22.4 AS builder

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
RUN go build -o backend .

# Stage 2: Create the final image
FROM alpine:latest

# Install CA certificates (required for HTTPS)
RUN apk --no-cache add ca-certificates

# Set the Current Working Directory inside the container
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/backend .

# Ensure the binary has execute permissions
RUN chmod +x backend

# (Optional) Verify the binary exists and is executable
RUN ls -la backend

# Command to run the executable
CMD ["./backend"]
