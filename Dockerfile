# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Backend API URL injected during Vite build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build production frontend
RUN npm run build

# Dedicated CI Test stage (docker build --target test)
FROM build AS test

WORKDIR /app

CMD ["npm", "run", "test"]


# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built frontend
COPY --from=build /app/dist ./dist

# Keep node_modules because vite is required by "vite preview"
COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/vite.config.js ./vite.config.js

EXPOSE 4173

CMD ["node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "4173"]