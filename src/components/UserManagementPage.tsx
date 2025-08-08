import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

export const UserManagementPage = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [me, setMe] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const [{ data: userData }, { data: isAdminData, error: rpcError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.rpc('is_admin'),
      ]);
      const uid = userData.user?.id ?? null;
      setMe(uid);
      if (rpcError) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(Boolean(isAdminData));
      if (!isAdminData) return;

      const [{ data: profs, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      if (pErr || rErr) {
        toast({ title: 'Failed to load users', description: pErr?.message || rErr?.message, variant: 'destructive' });
        return;
      }
      setProfiles(profs || []);
      setAdminIds(new Set((roles || []).filter(r => r.role === 'admin').map(r => r.user_id)));
    };
    init();
  }, [toast]);

  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setAdminIds(prev => new Set(prev).add(userId));
      toast({ title: 'Role updated', description: 'User is now an admin.' });
    } else {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setAdminIds(prev => { const n = new Set(prev); n.delete(userId); return n; });
      toast({ title: 'Role updated', description: 'Admin role removed.' });
    }
  };

  if (isAdmin === null) return null;
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You are not authorized to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profiles.map((p) => {
              const isAdm = adminIds.has(p.id);
              const self = me === p.id;
              return (
                <div key={p.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{p.full_name || p.email || p.id}</div>
                    <div className="text-xs text-muted-foreground">{p.email || 'No email'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdm && <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Admin</span>}
                    <Button
                      variant={isAdm ? 'outline' : 'default'}
                      onClick={() => toggleAdmin(p.id, !isAdm)}
                      disabled={self}
                    >
                      {isAdm ? 'Remove admin' : 'Make admin'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Users must sign up and verify their email before you can grant roles.</p>
        </CardContent>
      </Card>
    </div>
  );
};
