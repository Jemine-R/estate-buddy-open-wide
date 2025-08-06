import { useState } from "react";
import { Upload, X, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const SettingsPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "Admin User",
    email: "admin@estatebuddy.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    photo: null as string | null,
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setAdminData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAdminData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!adminData.name || !adminData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const handleChangePassword = () => {
    if (!adminData.currentPassword || !adminData.newPassword || !adminData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (adminData.newPassword !== adminData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password changed successfully",
    });

    setAdminData(prev => ({ 
      ...prev, 
      currentPassword: "", 
      newPassword: "", 
      confirmPassword: "" 
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-black">Settings</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {adminData.photo ? (
                <img src={adminData.photo} alt="Admin" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  <span className="text-2xl font-semibold">A</span>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="admin-photo"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('admin-photo')?.click()}
                className="absolute -bottom-2 -right-2"
              >
                <Upload className="h-3 w-3" />
              </Button>
              {adminData.photo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAdminData(prev => ({ ...prev, photo: null }))}
                  className="absolute -top-2 -right-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Profile Photo</p>
              <p className="text-xs text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                value={adminData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="bg-black text-white hover:bg-gray-800">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? "text" : "password"}
                value={adminData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={adminData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
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
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={adminData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button onClick={handleChangePassword} className="bg-black text-white hover:bg-gray-800">
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};