-- SQL Migration Script for KrishiBandhu Supabase Database Setup

-- 1. Create Profiles Table (Supports both Supabase Auth Users & Direct Postgres Registrations)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    state TEXT,
    district TEXT,
    location_address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Farmer Crops Table
CREATE TABLE IF NOT EXISTS public.farmer_crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    custom_crop_name TEXT,
    land_size NUMERIC NOT NULL,
    land_unit TEXT NOT NULL CHECK (land_unit IN ('Acre', 'Hectare', 'Bigha')),
    sowing_date DATE NOT NULL,
    irrigation_type TEXT NOT NULL CHECK (irrigation_type IN ('Rain-fed', 'Canal', 'Borewell', 'Tube well', 'Drip', 'Sprinkler', 'Other')),
    soil_type TEXT NOT NULL CHECK (soil_type IN ('Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy', 'Other')),
    expected_harvest_date DATE NOT NULL,
    loan_amount NUMERIC DEFAULT 0,
    loan_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Profiles (Allows Anon & Public Role)
DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;
CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

-- 5. RLS Policies for Farmer Crops (Allows Anon & Public Role)
DROP POLICY IF EXISTS "Allow public select farmer_crops" ON public.farmer_crops;
CREATE POLICY "Allow public select farmer_crops" ON public.farmer_crops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert farmer_crops" ON public.farmer_crops;
CREATE POLICY "Allow public insert farmer_crops" ON public.farmer_crops FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update farmer_crops" ON public.farmer_crops;
CREATE POLICY "Allow public update farmer_crops" ON public.farmer_crops FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete farmer_crops" ON public.farmer_crops;
CREATE POLICY "Allow public delete farmer_crops" ON public.farmer_crops FOR DELETE USING (true);

-- 6. Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_timestamp ON public.profiles;
CREATE TRIGGER set_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_farmer_crops_timestamp ON public.farmer_crops;
CREATE TRIGGER set_farmer_crops_timestamp
    BEFORE UPDATE ON public.farmer_crops
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
