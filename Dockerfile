# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# API URL used during the Vite build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the app
COPY . .
RUN npm run build


# Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy required build files
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/vite.config.js ./vite.config.js

EXPOSE 4173

# Start the production preview server
CMD ["node_modules/.bin/vite", "preview", "--host"]