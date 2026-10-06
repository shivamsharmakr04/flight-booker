# 🚀 Render Deployment Guide

This project is fully structured and prepared for seamless deployment on **[Render](https://render.com/)**.

---

## 🌟 Method 1: 1-Click Blueprint Deployment (Recommended)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint that automatically provisions and links both the **Backend API Service** and the **Frontend Static Site**.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** at the top right and select **Blueprint**.
4. Connect your Git repository.
5. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **`flight-booking-backend`** (Node.js Web Service)
   - **`flight-booking-frontend`** (Static Site with SPA rewrite rules)
6. Supply the required environment variables when prompted:
   - `MONGO_URI`: Your reachable MongoDB connection string (e.g., from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)). Do not use `localhost` or `127.0.0.1` on Render.
   - `GEMINI_API_KEY`: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
7. Make sure the MongoDB network access list allows connections from Render. Render outbound addresses may change; use an appropriate Atlas network access rule and protect access with a strong database password.
8. Click **Apply**. Render will build and deploy both services!

The Blueprint generates `JWT_SECRET` automatically. If the backend logs report `ECONNREFUSED ::1:27017`, it is trying to connect to a local MongoDB instance inside the Render container. Set the backend service's `MONGO_URI` environment variable to your hosted database URI, save it, and redeploy.

---

## 🛠️ Method 2: Manual Dashboard Setup

If you prefer to create the services individually in the Render dashboard:

### Step 1: Deploy Backend (Web Service)
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `flight-booking-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Add **Environment Variables**:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | *(Random 32+ character string)* | For token encryption |
   | `GEMINI_API_KEY` | *(Your Gemini API Key)* | From Google AI Studio |
   | `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Ultra-fast responses |
   | `FRONTEND_URL` | `https://your-frontend.onrender.com` | Your frontend URL |
5. Click **Create Web Service**. Note down the assigned URL (e.g. `https://flight-booking-backend.onrender.com`).

Create a hosted MongoDB database before deploying the backend and set `MONGO_URI` to its connection string. Do not leave it blank or set it to `mongodb://localhost:27017/flightdb`; Render does not run MongoDB in the backend service container. The Blueprint creates `JWT_SECRET` automatically, while a manually configured service needs a long, randomly generated value for it.

---

### Step 2: Deploy Frontend (Static Site)
1. In Render Dashboard, click **New +** ➔ **Static Site**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `flight-booking-frontend`
   - **Root Directory**: *(leave blank for root)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Redirect / Rewrite Rules**:
   - Go to **Redirects/Rewrites** tab in your static site settings.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(This ensures client-side routes like `/bookings` or `/search` reload cleanly).*
5. Add **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://flight-booking-backend.onrender.com/api` |
6. Click **Create Static Site**.

---

## 🧪 Post-Deployment Verification

1. **Health Check**: Open `https://your-backend.onrender.com/health` in your browser. It should respond with:
   ```json
   { "status": "ok", "service": "flight-backend" }
   ```
2. **Auto-Seed Verification**: The backend automatically checks MongoDB on startup and seeds initial flight inventory if the collection is empty.
3. **AI Trip Planner**: Click the **AI Assistant** button in the frontend. Ask `Find flights from Delhi to Mumbai under ₹3,000` to verify live AI responses and fast streaming.
