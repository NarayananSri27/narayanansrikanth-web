-- ==============================================================================
-- NARAYANAN SRIKANTH — PERSONAL WEBSITE DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. MEMBERS TABLE (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    instagram_username TEXT,
    instagram_popup_dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup and search
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 2. VISITOR ACTIVITY TABLE (Logs authenticated page visits)
CREATE TABLE IF NOT EXISTS public.visitor_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    event_type TEXT DEFAULT 'page_visit' NOT NULL,
    visited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast activity queries and member history filtering
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.visitor_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_visited_at ON public.visitor_activity(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_page_path ON public.visitor_activity(page_path);

-- Enable Row Level Security (RLS)
ALTER TABLE public.visitor_activity ENABLE ROW LEVEL SECURITY;

-- 3. PHOTOS TABLE (Metadata for photos stored in private storage)
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    caption TEXT,
    album TEXT NOT NULL DEFAULT 'Montréal & Campus',
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_photos_album ON public.photos(album);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 4. RESEARCH NOTES TABLE
CREATE TABLE IF NOT EXISTS public.research_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    topic TEXT NOT NULL DEFAULT 'Quantitative Risk',
    abstract TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_research_topic ON public.research_entries(topic);
CREATE INDEX IF NOT EXISTS idx_research_created_at ON public.research_entries(created_at DESC);

ALTER TABLE public.research_entries ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper: Function to check if the current requesting user is the website owner
-- (Replace 'narayanansri2007@gmail.com' with your actual Google account email)
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'narayanansri2007@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MEMBERS POLICIES:
-- A member can view their own profile; Owner can view all members in Admin Directory
CREATE POLICY "Members can view own profile or owner can view all"
    ON public.members
    FOR SELECT
    USING (auth.uid() = id OR public.is_owner());

-- Members can update ONLY their own profile (e.g. Instagram handle)
CREATE POLICY "Members can update own profile"
    ON public.members
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own profile on first sign-in
CREATE POLICY "Members can insert their own profile"
    ON public.members
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- VISITOR ACTIVITY POLICIES:
-- Authenticated users can insert page visit events for their own account
CREATE POLICY "Users can log their own visits"
    ON public.visitor_activity
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ONLY the owner can read activity logs (protects privacy against ordinary members)
CREATE POLICY "Only owner can view visitor activity logs"
    ON public.visitor_activity
    FOR SELECT
    USING (public.is_owner());

-- PHOTOS POLICIES:
-- All signed-in authenticated users can view photos
CREATE POLICY "Authenticated users can view photos"
    ON public.photos
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ONLY owner can insert, update, or delete photos
CREATE POLICY "Owner can manage photos"
    ON public.photos
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RESEARCH NOTES POLICIES:
-- All signed-in authenticated users can view research notes
CREATE POLICY "Authenticated users can view research"
    ON public.research_entries
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ONLY owner can insert, update, or delete research notes
CREATE POLICY "Owner can manage research entries"
    ON public.research_entries
    FOR ALL
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- ==============================================================================
-- PRIVATE STORAGE BUCKET CONFIGURATION
-- ==============================================================================
-- 1. Create a private bucket called 'private-photos' in Supabase Storage.
-- 2. Storage policy for reading photos:
--    (bucket_id = 'private-photos' AND auth.role() = 'authenticated')
-- 3. Storage policy for uploading/deleting photos:
--    (bucket_id = 'private-photos' AND (auth.jwt() ->> 'email') = 'narayanansri2007@gmail.com')

