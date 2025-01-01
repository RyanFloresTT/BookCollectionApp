# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Create env file from build args
ARG REACT_APP_AUTH0_DOMAIN
ARG REACT_APP_AUTH0_CLIENT_ID
ARG REACT_APP_AUTH0_AUDIENCE
ARG REACT_APP_AUTH0_CALLBACK_URL
ARG REACT_APP_API_URL
ARG REACT_APP_STRIPE_PUBLIC_KEY

ENV REACT_APP_AUTH0_DOMAIN=$REACT_APP_AUTH0_DOMAIN
ENV REACT_APP_AUTH0_CLIENT_ID=$REACT_APP_AUTH0_CLIENT_ID
ENV REACT_APP_AUTH0_AUDIENCE=$REACT_APP_AUTH0_AUDIENCE
ENV REACT_APP_AUTH0_CALLBACK_URL=$REACT_APP_AUTH0_CALLBACK_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config template
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.template

# Copy built files
COPY build/ /usr/share/nginx/html

# Use environment variable substitution
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
