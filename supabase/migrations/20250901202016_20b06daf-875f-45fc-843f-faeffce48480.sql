-- Fix security issues: Add RLS policies for recoverable_key_cards table
ALTER TABLE public.recoverable_key_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view recoverable key cards"
ON public.recoverable_key_cards
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert recoverable key cards"  
ON public.recoverable_key_cards
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update recoverable key cards"
ON public.recoverable_key_cards  
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete recoverable key cards"
ON public.recoverable_key_cards
FOR DELETE  
USING (is_admin());

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;