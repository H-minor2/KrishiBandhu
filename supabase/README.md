# Supabase Setup Guide for KrishiBandhu

This directory contains the database migration scripts and configuration guides for storing Farmer and Crop registration details in your Supabase Postgres database.

## 🚀 Quick Setup Instructions

### 1. Execute SQL Migration in Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project (or create a new free project).
3. Navigate to **SQL Editor** from the left navigation bar.
4. Open `supabase/migrations/01_create_farmer_crop_tables.sql` from this repository.
5. Paste the entire SQL contents into the query editor and click **Run**.

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` in your root folder:

```bash
cp .env.example .env.local
```

Add your Supabase Credentials (found in your Supabase Dashboard under **Project Settings -> API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Verification & Security
- The migration enables **Row Level Security (RLS)** by default.
- Farmers can only view, create, edit, or delete their own profiles and crop records.
- Local demo fallback is automatically active when environment variables are not set, allowing full interactive testing in offline mode.
