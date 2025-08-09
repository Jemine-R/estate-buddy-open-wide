-- Add avatar_url to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ensure profiles auto-create on signup via trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create public avatars bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
-- Allow public read of avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view avatars'
  ) THEN
    CREATE POLICY "Public can view avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Allow authenticated users or admins to upload (folder convention: <uid>/filename)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can upload own folder to avatars'
  ) THEN
    CREATE POLICY "Authenticated can upload own folder to avatars"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin()));
  END IF;
END $$;

-- Allow owners or admins to update/delete their files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owners or admins can update avatars'
  ) THEN
    CREATE POLICY "Owners or admins can update avatars"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'avatars' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owners or admins can delete avatars'
  ) THEN
    CREATE POLICY "Owners or admins can delete avatars"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'avatars' AND ((auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin()));
  END IF;
END $$;