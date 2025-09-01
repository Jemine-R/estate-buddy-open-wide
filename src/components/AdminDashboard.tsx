import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Eye, EyeOff, Plus, Mail, Key, User, Users, Settings } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user" as "user" | "admin",
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      const [{ data: userData }, { data: isAdminData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.rpc('is_admin'),
      ]);

      if (!userData.user) return;
      
      setIsAdmin(Boolean(isAdminData));
      
      if (!isAdminData) return;

      // Load current user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (userProfile) {
        setCurrentUser(userProfile);
        setProfileForm({
          full_name: userProfile.full_name || "",
          email: userProfile.email || "",
          avatar_url: userProfile.avatar_url || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      // Load all profiles and roles
      const [{ data: allProfiles }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      setProfiles(allProfiles || []);
      setAdminIds(new Set((roles || []).filter(r => r.role === 'admin').map(r => r.user_id)));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileForm(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({ title: 'Success', description: 'Avatar uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          avatar_url: profileForm.avatar_url,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? {
        ...prev,
        full_name: profileForm.full_name,
        avatar_url: profileForm.avatar_url,
      } : null);

      toast({ title: 'Success', description: 'Profile updated successfully' });
      await initializeData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!profileForm.newPassword || !profileForm.confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all password fields', variant: 'destructive' });
      return;
    }

    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: profileForm.newPassword
      });

      if (error) throw error;

      setProfileForm(prev => ({ 
        ...prev, 
        currentPassword: "", 
        newPassword: "", 
        confirmPassword: "" 
      }));

      toast({ title: 'Success', description: 'Password updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password) {
      toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserForm.email,
        password: newUserForm.password,
        user_metadata: {
          full_name: newUserForm.full_name,
        }
      });

      if (error) throw error;

      // Add role if admin
      if (newUserForm.role === 'admin' && data.user) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'admin'
        });
      }

      toast({ title: 'Success', description: 'User created successfully' });
      setCreateUserDialog(false);
      setNewUserForm({ email: '', password: '', full_name: '', role: 'user' });
      await initializeData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Confirmation email sent' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setLoading(true);
    try {
      if (makeAdmin) {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
        setAdminIds(prev => new Set(prev).add(userId));
        toast({ title: 'Success', description: 'User is now an admin' });
      } else {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
        setAdminIds(prev => { const n = new Set(prev); n.delete(userId); return n; });
        toast({ title: 'Success', description: 'Admin role removed' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) return null;
  
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You are not authorized to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileForm.avatar_url} />
                  <AvatarFallback>
                    {profileForm.full_name?.charAt(0) || profileForm.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Avatar
                  </Button>
                  {profileForm.avatar_url && (
                    <Button
                      variant="ghost"
                      onClick={() => setProfileForm(prev => ({ ...prev, avatar_url: '' }))}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    placeholder="Email cannot be changed here"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Secure password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={newUserForm.full_name}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={newUserForm.role === 'user' ? 'default' : 'outline'}
                        onClick={() => setNewUserForm(prev => ({ ...prev, role: 'user' }))}
                      >
                        User
                      </Button>
                      <Button
                        variant={newUserForm.role === 'admin' ? 'default' : 'outline'}
                        onClick={() => setNewUserForm(prev => ({ ...prev, role: 'admin' }))}
                      >
                        Admin
                      </Button>
                    </div>
                    <Button onClick={handleCreateUser} disabled={loading} className="w-full">
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => {
                  const isAdm = adminIds.has(profile.id);
                  const isSelf = currentUser?.id === profile.id;
                  
                  return (
                    <div key={profile.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile.avatar_url || ''} />
                          <AvatarFallback>
                            {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{profile.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{profile.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isAdm && <Badge variant="secondary">Admin</Badge>}
                        {isSelf && <Badge variant="outline">You</Badge>}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendConfirmation(profile.email || '')}
                          disabled={loading || !profile.email}
                          className="flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          Resend Email
                        </Button>
                        
                        <Button
                          variant={isAdm ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleAdmin(profile.id, !isAdm)}
                          disabled={loading || isSelf}
                        >
                          {isAdm ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={loading}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};