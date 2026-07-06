# ---- Build Stage ----
FROM golang:1.22-alpine AS builder

# Use Chinese Go proxy for faster downloads
ENV GOPROXY=https://goproxy.cn,direct
ENV CGO_ENABLED=0
ENV GOOS=linux

WORKDIR /app

# Download dependencies first (layer caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static binary
RUN go build -ldflags="-s -w" -o /codeflash .

# ---- Run Stage ----
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Shanghai

WORKDIR /app

# Copy binary from builder
COPY --from=builder /codeflash .

# Copy data directory
COPY data/ ./data/

# Create directory for SQLite database
RUN mkdir -p /app/data

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/categories || exit 1

ENTRYPOINT ["./codeflash"]
