# =============================================================================
# RestaurantOS - Backend (Node.js / Express + Sequelize + PostgreSQL)
# =============================================================================
FROM node:18-alpine AS base

# Install OS-level tools needed for native module builds (bcrypt, pg, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# ---- Dependencies layer (cached separately from source for faster rebuilds) --
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Application source -----------------------------------------------------
COPY . .

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

# Backend listens on PORT from .env (default 5001)
EXPOSE 5001

# Basic container health check against the API
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5001/api/health || exit 1

CMD ["node", "server.js"]