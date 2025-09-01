-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for user_roles table  
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.user_roles;

-- Enable realtime for residents table
ALTER TABLE public.residents REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.residents;

-- Enable realtime for key_cards table
ALTER TABLE public.key_cards REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.key_cards;