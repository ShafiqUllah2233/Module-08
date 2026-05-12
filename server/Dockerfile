# ---- Backend: Node + Express API ----
FROM node:20-alpine
LABEL maintainer="integration-team"
LABEL version="1.0"
LABEL description="G08 Dispute Resolution - Backend API"

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create upload directory for file storage
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 4000

CMD ["node", "src/server.js"]
