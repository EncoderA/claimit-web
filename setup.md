# Setup & Deployment Guide

This guide details the procedures for environment configuration, local development startup, production compilation, and containerized deployment using Docker.

---

## 1. System Prerequisites

Refer to [requirements.txt] for runtime versions. Make sure the following tools are installed:
- **Node.js** (v20+)
- **npm** (v10+)
- **Docker** & **Docker Compose**

---

## 2. Environment Configuration

The frontend dynamically requests backend services using the `VITE_API_BASE_URL` environment variable.

1. Copy the example environment template:
   ```bash
   cp .env.example .env
   ```
2. Configure `.env` values:
   - `VITE_API_BASE_URL`: Base API address of the Spring Boot application (e.g., `http://localhost:8080`).

---

## 3. Local Development Workflow

To initialize and run the local Vite server:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development hot-reloaded server:
   ```bash
   npm run dev
   ```
   *The server defaults to port `5173` on `http://localhost:5173`.*

3. Run syntax validation & lint checks:
   ```bash
   npm run lint
   ```

---

## 4. Production Compilation

Vite inlines all `VITE_*` environment variables at compile-time. Ensure your `.env` is loaded with correct production endpoint values before compiling.

1. Build static production distribution files:
   ```bash
   npm run build
   ```
2. The built files will output to the `./dist/` directory.
3. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 5. Docker & Containerized Workflow

The frontend includes container configurations for dev/prod workflows.

### Dev/Runtime Container (Hot-reloaded)
To run the frontend dev environment inside a container:

1. Launch using Docker Compose:
   ```bash
   docker-compose up --build
   ```
2. Access the container host interface at `http://localhost:5173`.

### Production Build Container
If compiling the static assets inside a container stage:
1. Build the Docker image, injecting the environment base URL:
   ```bash
   docker build --build-arg VITE_API_BASE_URL=http://your-production-backend-ip:8080 -t claimit-frontend .
   ```
2. Run the image:
   ```bash
   docker run -p 5173:5173 claimit-frontend
   ```

---

## 6. Route & Authorization Architecture
- **Login Endpoint:** `POST /api/v1/auth/login`
- **Silent Refresh Endpoint:** `POST /api/v1/auth/refresh`
- **Logout Endpoint:** `POST /api/v1/auth/logout` (best-effort token revocation)
- **Role Redirections:** `EMPLOYEE` -> `/employee`, `MANAGER` -> `/manager`, `FINANCE` -> `/finance`, `ADMIN` -> `/admin`.
