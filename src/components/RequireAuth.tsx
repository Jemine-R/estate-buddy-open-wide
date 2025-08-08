import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RequireAuthProps { children: ReactNode }

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const confirmed = Boolean((session as any)?.user?.email_confirmed_at);
      if (!session || !confirmed) {
        navigate("/auth", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const confirmed = Boolean((session as any)?.user?.email_confirmed_at);
      if (!session || !confirmed) {
        navigate("/auth", { replace: true });
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking) return null;
  return <>{children}</>;
};
