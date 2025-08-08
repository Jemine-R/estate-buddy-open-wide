-- Enable admin management of roles and profile visibility, and create signup trigger

-- 1) Create trigger to maintain profiles on new auth user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 2) user_roles: allow admins to manage roles
-- Allow admins to select all roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
    ON public.user_roles
    FOR SELECT
    USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to insert roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can insert roles'
  ) THEN
    CREATE POLICY "Admins can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Allow admins to update roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can update roles'
  ) THEN
    CREATE POLICY "Admins can update roles"
    ON public.user_roles
    FOR UPDATE
    USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to delete roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can delete roles'
  ) THEN
    CREATE POLICY "Admins can delete roles"
    ON public.user_roles
    FOR DELETE
    USING (public.is_admin());
  END IF;
END $$;

-- 3) profiles: allow admins to view all profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can view profiles'
  ) THEN
    CREATE POLICY "Admins can view profiles"
    ON public.profiles
    FOR SELECT
    USING (public.is_admin());
  END IF;
END $$;