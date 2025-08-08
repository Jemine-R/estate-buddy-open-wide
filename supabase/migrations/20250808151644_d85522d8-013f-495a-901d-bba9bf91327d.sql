-- Initial secure schema with auth, roles, residents, key_cards, and soft delete/restore

-- 1) Utility function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Profiles table synced with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic policies: users can read their own profile, admins can read all (admin function added later)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Trigger
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Enum for app roles and user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- 4) Security definer to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 5) Residents with soft delete
CREATE TABLE IF NOT EXISTS public.residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  house_number TEXT,
  phone TEXT,
  occupation TEXT,
  resident_since DATE,
  rent_status TEXT CHECK (rent_status IN ('paid','due-soon','overdue')) DEFAULT 'paid',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Only admins can access/modify residents
DROP POLICY IF EXISTS "Admins can view residents" ON public.residents;
CREATE POLICY "Admins can view residents" ON public.residents
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert residents" ON public.residents;
CREATE POLICY "Admins can insert residents" ON public.residents
FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update residents" ON public.residents;
CREATE POLICY "Admins can update residents" ON public.residents
FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete residents" ON public.residents;
CREATE POLICY "Admins can delete residents" ON public.residents
FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS residents_updated_at ON public.residents;
CREATE TRIGGER residents_updated_at
BEFORE UPDATE ON public.residents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Key cards with soft delete
DO $$ BEGIN
  CREATE TYPE public.key_card_status AS ENUM ('ACTIVE','INACTIVE','LOST','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.key_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number TEXT NOT NULL UNIQUE,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  status public.key_card_status NOT NULL DEFAULT 'ACTIVE',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.key_cards ENABLE ROW LEVEL SECURITY;

-- Only admins can access/modify key cards
DROP POLICY IF EXISTS "Admins can view key cards" ON public.key_cards;
CREATE POLICY "Admins can view key cards" ON public.key_cards
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert key cards" ON public.key_cards;
CREATE POLICY "Admins can insert key cards" ON public.key_cards
FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update key cards" ON public.key_cards;
CREATE POLICY "Admins can update key cards" ON public.key_cards
FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete key cards" ON public.key_cards;
CREATE POLICY "Admins can delete key cards" ON public.key_cards
FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS key_cards_updated_at ON public.key_cards;
CREATE TRIGGER key_cards_updated_at
BEFORE UPDATE ON public.key_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Deletion log for recoverability (key cards)
CREATE TABLE IF NOT EXISTS public.deleted_items_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('key_card','resident')),
  item_id UUID NOT NULL,
  deleted_by UUID NOT NULL REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  restore_deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  metadata JSONB
);

ALTER TABLE public.deleted_items_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view deleted items" ON public.deleted_items_log
FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert deleted items" ON public.deleted_items_log
FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete own logs" ON public.deleted_items_log
FOR DELETE USING (public.is_admin());

-- 8) Soft delete/restore functions for key cards
CREATE OR REPLACE FUNCTION public.soft_delete_key_card(card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID := auth.uid();
  card_data JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete key cards';
  END IF;

  SELECT to_jsonb(k.*) INTO card_data FROM public.key_cards k
  WHERE k.id = card_id AND k.deleted_at IS NULL;

  IF card_data IS NULL THEN
    RAISE EXCEPTION 'Key card not found or already deleted';
  END IF;

  UPDATE public.key_cards SET deleted_at = now(), deleted_by = admin_id
  WHERE id = card_id;

  INSERT INTO public.deleted_items_log (item_type, item_id, deleted_by, metadata)
  VALUES ('key_card', card_id, admin_id, card_data);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.restore_key_card(card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can restore key cards';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.deleted_items_log
    WHERE item_id = card_id AND item_type = 'key_card' AND restore_deadline > now()
  ) THEN
    RAISE EXCEPTION 'Restore deadline passed or item not found';
  END IF;

  UPDATE public.key_cards SET deleted_at = NULL, deleted_by = NULL
  WHERE id = card_id;

  DELETE FROM public.deleted_items_log WHERE item_id = card_id AND item_type = 'key_card';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View of recoverable key cards for admins
CREATE OR REPLACE VIEW public.recoverable_key_cards AS
SELECT 
  k.id,
  k.card_number,
  k.resident_id,
  r.full_name AS resident_name,
  k.status,
  k.deleted_at,
  k.deleted_by,
  p.full_name AS deleted_by_name,
  d.restore_deadline,
  (d.restore_deadline > now()) AS can_restore
FROM public.key_cards k
JOIN public.deleted_items_log d ON d.item_id = k.id AND d.item_type = 'key_card'
LEFT JOIN public.residents r ON r.id = k.resident_id
LEFT JOIN public.profiles p ON p.id = k.deleted_by
WHERE k.deleted_at IS NOT NULL
ORDER BY k.deleted_at DESC;

GRANT SELECT ON public.recoverable_key_cards TO authenticated;

-- 9) Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
