-- Enhanced security migration with delete functionality and authentication

-- Update key_cards table to support soft delete and recovery
ALTER TABLE public.key_cards 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

-- Add audit trail for deletions
CREATE TABLE IF NOT EXISTS public.deleted_items_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL, -- 'key_card', 'resident', etc.
  item_id TEXT NOT NULL,
  deleted_by UUID NOT NULL REFERENCES public.profiles(id),
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  restore_deadline TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  metadata JSONB -- Store original data for potential restoration
);

-- Enable RLS on deleted_items_log
ALTER TABLE public.deleted_items_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for deleted_items_log
CREATE POLICY "Admins can view all deleted items" 
ON public.deleted_items_log 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can create deletion logs" 
ON public.deleted_items_log 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Update key_cards RLS policies to exclude soft-deleted cards by default
DROP POLICY IF EXISTS "Admins can view all key cards" ON public.key_cards;
CREATE POLICY "Admins can view active key cards" 
ON public.key_cards 
FOR SELECT 
USING (public.is_admin() AND deleted_at IS NULL);

-- Policy to view deleted key cards (for admin recovery interface)
CREATE POLICY "Admins can view deleted key cards for recovery" 
ON public.key_cards 
FOR SELECT 
USING (public.is_admin() AND deleted_at IS NOT NULL);

-- Function to soft delete key card
CREATE OR REPLACE FUNCTION public.soft_delete_key_card(
  card_id UUID,
  admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  card_data JSONB;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_id) THEN
    RAISE EXCEPTION 'Only admins can delete key cards';
  END IF;

  -- Get card data for backup
  SELECT to_jsonb(k.*) INTO card_data 
  FROM public.key_cards k 
  WHERE k.id = card_id AND k.deleted_at IS NULL;

  IF card_data IS NULL THEN
    RAISE EXCEPTION 'Key card not found or already deleted';
  END IF;

  -- Soft delete the card
  UPDATE public.key_cards 
  SET deleted_at = now(), deleted_by = admin_id 
  WHERE id = card_id;

  -- Log the deletion
  INSERT INTO public.deleted_items_log (item_type, item_id, deleted_by, metadata)
  VALUES ('key_card', card_id::text, admin_id, card_data);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore soft deleted key card
CREATE OR REPLACE FUNCTION public.restore_key_card(
  card_id UUID,
  admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user(admin_id) THEN
    RAISE EXCEPTION 'Only admins can restore key cards';
  END IF;

  -- Check if within restore deadline
  IF NOT EXISTS (
    SELECT 1 FROM public.deleted_items_log 
    WHERE item_id = card_id::text 
    AND item_type = 'key_card'
    AND restore_deadline > now()
  ) THEN
    RAISE EXCEPTION 'Restore deadline has passed or item not found';
  END IF;

  -- Restore the card
  UPDATE public.key_cards 
  SET deleted_at = NULL, deleted_by = NULL 
  WHERE id = card_id;

  -- Remove from deletion log
  DELETE FROM public.deleted_items_log 
  WHERE item_id = card_id::text AND item_type = 'key_card';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete expired soft-deleted items
CREATE OR REPLACE FUNCTION public.cleanup_expired_deletions()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
  expired_record RECORD;
BEGIN
  -- Get expired deletion records
  FOR expired_record IN 
    SELECT item_type, item_id::uuid as id 
    FROM public.deleted_items_log 
    WHERE restore_deadline < now()
  LOOP
    -- Permanently delete based on item type
    IF expired_record.item_type = 'key_card' THEN
      DELETE FROM public.key_cards WHERE id = expired_record.id;
    END IF;
    
    cleanup_count := cleanup_count + 1;
  END LOOP;

  -- Remove expired logs
  DELETE FROM public.deleted_items_log WHERE restore_deadline < now();
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admins to see recoverable key cards
CREATE OR REPLACE VIEW public.recoverable_key_cards AS
SELECT 
  k.id,
  k.card_number,
  k.resident_id,
  r.full_name as resident_name,
  k.status,
  k.deleted_at,
  k.deleted_by,
  p.full_name as deleted_by_name,
  d.restore_deadline,
  (d.restore_deadline > now()) as can_restore
FROM public.key_cards k
JOIN public.deleted_items_log d ON d.item_id = k.id::text AND d.item_type = 'key_card'
LEFT JOIN public.residents r ON r.id = k.resident_id
LEFT JOIN public.profiles p ON p.id = k.deleted_by
WHERE k.deleted_at IS NOT NULL
ORDER BY k.deleted_at DESC;

-- Grant access to the view for admins
GRANT SELECT ON public.recoverable_key_cards TO authenticated;

-- Add session tracking for enhanced security
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '8 hours'),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.admin_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.admin_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.admin_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(session_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  session_valid BOOLEAN := false;
BEGIN
  -- Check if session exists and is valid
  SELECT EXISTS(
    SELECT 1 FROM public.admin_sessions 
    WHERE session_token = validate_admin_session.session_token
    AND is_active = true 
    AND expires_at > now()
  ) INTO session_valid;

  -- Update last_activity if session is valid
  IF session_valid THEN
    UPDATE public.admin_sessions 
    SET last_activity = now() 
    WHERE session_token = validate_admin_session.session_token;
  END IF;

  RETURN session_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin session
CREATE OR REPLACE FUNCTION public.create_admin_session(
  user_id UUID,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Generate session token
  new_token := encode(gen_random_bytes(32), 'base64');
  
  -- Deactivate old sessions for this user
  UPDATE public.admin_sessions 
  SET is_active = false 
  WHERE user_id = create_admin_session.user_id AND is_active = true;
  
  -- Create new session
  INSERT INTO public.admin_sessions (user_id, session_token, ip_address, user_agent)
  VALUES (user_id, new_token, ip_address, user_agent);
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;