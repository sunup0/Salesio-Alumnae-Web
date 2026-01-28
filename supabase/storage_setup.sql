-- 1. Add photo_url column to alumnae table
ALTER TABLE public.alumnae 
ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Create the storage bucket 'alumnae-photos'
-- Note: 'public' is a schema in creating tables, but for buckets we insert into storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('alumnae-photos', 'alumnae-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Security Policies (RLS)
-- Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'alumnae-photos' );

-- Allow Public Upload Access (for ease of use in this demo)
-- WARNING: In a production app with Auth, you should restrict this to authenticated users.
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'alumnae-photos' );

-- Allow Public Update/Delete (Optional, for full CRUD)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'alumnae-photos' );

CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'alumnae-photos' );
