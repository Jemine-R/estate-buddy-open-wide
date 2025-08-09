import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Secure Login & Signup | Estate Buddy";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const confirmed = Boolean((session as any)?.user?.email_confirmed_at);
      if (session && confirmed) {
        navigate("/dashboard", { replace: true });
      }
      if (session && !confirmed) {
        setNotice("Please verify your email to access the app.");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const confirmed = Boolean((session as any)?.user?.email_confirmed_at);
      if (session && confirmed) navigate("/dashboard", { replace: true });
      if (session && !confirmed) setNotice("Please verify your email to access the app.");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }
    // If email confirmation is required, session may exist but blocked by RequireAuth
    toast({ title: "Signed in", description: "Checking verification…" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }
    setNotice("Account created. Please check your email to verify your address.");
    toast({ title: "Sign up successful", description: "Verification email sent." });
  };

  const resendVerification = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Enter your email above to resend verification.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) {
      toast({ title: "Resend failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Verification sent", description: "Check your inbox for the confirmation link." });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Estate Buddy – Secure Access</CardTitle>
        </CardHeader>
        <CardContent>
          {notice && (
            <div className="mb-4 text-sm text-muted-foreground text-center">
              {notice}
              <div className="mt-2">
                <Button variant="secondary" size="sm" onClick={resendVerification} disabled={loading}>
                  {loading ? "Resending…" : "Resend verification email"}
                </Button>
              </div>
            </div>
          )}
          <form onSubmit={(e) => (authMode === "signup" ? signUp(e) : signIn(e))} className="space-y-3 pt-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : authMode === "signup" ? "Create account" : "Log in"}
            </Button>
          </form>
          <div className="pt-2 text-center text-sm text-muted-foreground">
            {authMode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="underline underline-offset-4"
                  onClick={() => setAuthMode("login")}
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
