# ---- Backend: Node + Express API ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create upload directory (also a volume mount target in compose)
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "src/server.js"]
