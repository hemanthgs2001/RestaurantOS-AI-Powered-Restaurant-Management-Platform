# # =============================================================================
# # RestaurantOS - AI Backend (FastAPI + Tesseract OCR + Scikit-learn)
# # =============================================================================
# FROM python:3.9-slim

# WORKDIR /app

# # Install system dependencies required for OCR (Tesseract) and PDF handling
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     tesseract-ocr \
#     tesseract-ocr-eng \
#     poppler-utils \
#     libgl1 \
#     libglib2.0-0 \
#     curl \
#     && rm -rf /var/lib/apt/lists/*

# # ---- Python dependencies (cached separately from source) --------------------
# COPY requirements.txt .
# RUN pip install --no-cache-dir --upgrade pip \
#     && pip install --no-cache-dir -r requirements.txt

# # ---- Application source -----------------------------------------------------
# COPY . .

# # Non-root user for security
# RUN useradd --create-home appuser && chown -R appuser:appuser /app
# USER appuser

# # AI service listens on 8000 (matches AI_API_URL in backend/.env)
# EXPOSE 8000

# HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
#     CMD curl -f http://localhost:8000/health || exit 1

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# =============================================================================
# RestaurantOS - Backend (Node.js / Express + Sequelize + PostgreSQL)
# =============================================================================
FROM node:18-alpine AS base

# Install OS-level tools needed for native module builds (bcrypt, pg, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# ---- Dependencies layer (cached separately from source for faster rebuilds) --
COPY package*.json ./
RUN npm install --omit=dev

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