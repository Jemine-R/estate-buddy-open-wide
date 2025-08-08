import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
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
    const redirectUrl = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }
    setNotice("Verification email sent. Please check your inbox.");
    toast({ title: "Verify your email", description: "We sent you a confirmation link." });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Estate Buddy – Secure Access</CardTitle>
        </CardHeader>
        <CardContent>
          {notice && (
            <div className="mb-4 text-sm text-muted-foreground text-center">{notice}</div>
          )}
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={signIn} className="space-y-3">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : "Log in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 pt-4">
              <form onSubmit={signUp} className="space-y-3">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : "Create account"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center">You'll need to verify your email before accessing the app.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
