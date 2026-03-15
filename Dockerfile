# ── Stage 1: Build Angular frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration production

# ── Stage 2: Backend + serve built frontend ───────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Copy compiled Angular app into backend public folder
COPY --from=frontend-build /app/frontend/dist/nailkolors-frontend/browser ./public

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 8080

CMD ["node", "server.js"]
