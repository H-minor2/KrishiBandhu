# Krishi Bandhu 🌾

Welcome to the official repository for **Krishi Bandhu** (formerly the Citizen Services Portal). This portal serves as a government gateway for agricultural data collection and farmer registration.

## 🚀 Quick Setup Guide

Because the project architecture has been split into a dedicated frontend and a Supabase backend, you need to follow these exact steps to run the platform locally on your machine.

### 1. Navigate to the Frontend
All UI and Next.js logic now lives inside the `frontend` directory. Open your terminal and run:
```bash
cd frontend
```

### 2. Install Dependencies
Whenever you pull new code (e.g., `git pull origin dev`), you must immediately install any new dependencies that were added by other contributors:
```bash
npm install
```

### 3. Setup the Database Connection (Supabase)
The app uses Supabase (a PostgreSQL database platform) to store farmer registration data. 
1. Inside the `frontend` directory, copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
*(Note: If you skip this step, the app will not crash. It will gracefully fall back to **Interactive Local Mode** and save your form submissions in browser memory so you can still test the UI!)*

### 4. Run the Development Server
Start up the local Next.js server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📱 How to Test on a Mobile Device (Live Network)

Because of strict modern browser security, features like the **"Fetch via Location Data"** button will be blocked if you try to access the site over a standard local Wi-Fi IP address (HTTP). The browser requires a secure HTTPS context to grant GPS access.

**To safely test mobile geolocation:**
1. Keep your Next.js server running (`npm run dev`).
2. Open a *new* terminal window.
3. Run this command to generate a free, temporary HTTPS tunnel to your local machine:
   ```bash
   npx localtunnel --port 3000
   ```
4. It will output a secure URL (e.g., `https://random-words.loca.lt`). Open this exact URL on your smartphone! The location features will now work perfectly.
