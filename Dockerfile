# ---- Frontend: Vite build + nginx static serving ----

# Stage 1 — build the React app with Vite
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 — serve the built assets with nginx
FROM nginx:1.27-alpine AS runtime

# Replace default nginx config with SPA-friendly one that also proxies /api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Vite build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
