# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Build-time arguments for Vite envs (prefixed with VITE_)
ARG VITE_API_BASE_URL=https://api.example.com
ARG VITE_ENV_NAME=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENV_NAME=$VITE_ENV_NAME

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
