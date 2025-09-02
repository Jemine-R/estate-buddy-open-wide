import { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Upload, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Resident {
  id: string;
  full_name: string;
  email: string | null;
  house_number: string | null;
  phone: string | null;
  occupation: string | null;
  photo_url: string | null;
  rent_status: string;
  resident_since: string | null;
  created_at: string;
}

export const ResidentsManagement = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [residentForm, setResidentForm] = useState({
    full_name: "",
    email: "",
    house_number: "",
    phone: "",
    occupation: "",
    photo_url: "",
    rent_status: "paid",
    resident_since: "",
  });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResidents(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setResidentForm(prev => ({ ...prev, photo_url: publicUrl }));
      
      toast({ title: 'Success', description: 'Photo uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResident = async () => {
    if (!residentForm.full_name) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (selectedResident) {
        // Update existing resident
        const { error } = await supabase
          .from('residents')
          .update({
            full_name: residentForm.full_name,
            email: residentForm.email || null,
            house_number: residentForm.house_number || null,
            phone: residentForm.phone || null,
            occupation: residentForm.occupation || null,
            photo_url: residentForm.photo_url || null,
            rent_status: residentForm.rent_status,
            resident_since: residentForm.resident_since || null,
          })
          .eq('id', selectedResident.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Resident updated successfully' });
      } else {
        // Create new resident
        const { error } = await supabase
          .from('residents')
          .insert({
            full_name: residentForm.full_name,
            email: residentForm.email || null,
            house_number: residentForm.house_number || null,
            phone: residentForm.phone || null,
            occupation: residentForm.occupation || null,
            photo_url: residentForm.photo_url || null,
            rent_status: residentForm.rent_status,
            resident_since: residentForm.resident_since || null,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Resident added successfully' });
      }

      await loadResidents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResidentForm({
      full_name: "",
      email: "",
      house_number: "",
      phone: "",
      occupation: "",
      photo_url: "",
      rent_status: "paid",
      resident_since: "",
    });
    setSelectedResident(null);
  };

  const openEditDialog = (resident: Resident) => {
    setSelectedResident(resident);
    setResidentForm({
      full_name: resident.full_name,
      email: resident.email || "",
      house_number: resident.house_number || "",
      phone: resident.phone || "",
      occupation: resident.occupation || "",
      photo_url: resident.photo_url || "",
      rent_status: resident.rent_status,
      resident_since: resident.resident_since || "",
    });
    setIsDialogOpen(true);
  };

  const handleRestrictAccess = async (residentId: string, residentName: string) => {
    try {
      // Update resident status or add restriction logic here
      toast({
        title: "Access Restricted",
        description: `Access has been restricted for ${residentName}`,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredResidents = residents.filter(resident =>
    resident.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.house_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "due-soon":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Rent Paid";
      case "due-soon":
        return "Due Soon";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Residents Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedResident ? 'Edit Resident' : 'Add New Resident'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={residentForm.photo_url} />
                  <AvatarFallback>
                    {residentForm.full_name?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={residentForm.full_name}
                    onChange={(e) => setResidentForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={residentForm.email}
                    onChange={(e) => setResidentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>House Number</Label>
                  <Input
                    value={residentForm.house_number}
                    onChange={(e) => setResidentForm(prev => ({ ...prev, house_number: e.target.value }))}
                    placeholder="e.g., A-101"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={residentForm.phone}
                    onChange={(e) => setResidentForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input
                    value={residentForm.occupation}
                    onChange={(e) => setResidentForm(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="Enter occupation"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Rent Status</Label>
                  <Select value={residentForm.rent_status} onValueChange={(value) => setResidentForm(prev => ({ ...prev, rent_status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="due-soon">Due Soon</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Resident Since</Label>
                  <Input
                    type="date"
                    value={residentForm.resident_since}
                    onChange={(e) => setResidentForm(prev => ({ ...prev, resident_since: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveResident} disabled={loading} className="flex-1">
                  {selectedResident ? 'Update' : 'Add'} Resident
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search residents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openEditDialog(resident)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={resident.photo_url || ""} alt={resident.full_name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {resident.full_name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{resident.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{resident.email}</p>
                    {resident.house_number && (
                      <p className="text-xs text-muted-foreground">{resident.house_number}</p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestrictAccess(resident.id, resident.full_name);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rent Status:</span>
                  <Badge className={getStatusColor(resident.rent_status)}>
                    {getStatusText(resident.rent_status)}
                  </Badge>
                </div>
                
                {resident.resident_since && (
                  <div className="text-xs text-muted-foreground">
                    Resident since {new Date(resident.resident_since).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};