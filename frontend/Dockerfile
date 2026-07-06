# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Use Chinese npm mirror
RUN npm config set registry https://registry.npmmirror.com

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# ---- Run Stage ----
FROM nginx:1.27-alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
