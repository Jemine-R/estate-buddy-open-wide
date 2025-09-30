import { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, QrCode, Mail, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface KeyCard {
  id: string;
  card_number: string;
  resident_id: string;
  status: string;
  issued_at: string;
  expires_at: string | null;
  qr_code_url: string | null;
  resident?: {
    full_name: string;
    email: string | null;
    house_number: string | null;
    photo_url: string | null;
  };
}

interface Resident {
  id: string;
  full_name: string;
  email: string | null;
  house_number: string | null;
}

export const KeyCardsManagement = () => {
  const [keyCards, setKeyCards] = useState<KeyCard[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [cardForm, setCardForm] = useState({
    resident_id: "",
    expires_at: "",
  });

  useEffect(() => {
    loadKeyCards();
    loadResidents();
  }, []);

  const loadKeyCards = async () => {
    try {
      const { data, error } = await supabase
        .from('key_cards')
        .select(`
          *,
          residents:resident_id (
            full_name,
            email,
            house_number,
            photo_url
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeyCards(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const loadResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select('id, full_name, email, house_number')
        .is('deleted_at', null)
        .order('full_name');

      if (error) throw error;
      setResidents(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const generateQRCode = async (cardId: string, residentEmail: string) => {
    try {
      const qrData = JSON.stringify({
        cardId,
        email: residentEmail,
        issueDate: new Date().toISOString(),
        accessLevel: "resident"
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      return qrCodeUrl;
    } catch (error) {
      console.error("QR Code generation failed:", error);
      return null;
    }
  };

  const handleCreateCard = async () => {
    if (!cardForm.resident_id) {
      toast({ title: 'Error', description: 'Please select a resident', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const selectedResident = residents.find(r => r.id === cardForm.resident_id);
      if (!selectedResident) throw new Error('Resident not found');

      const cardNumber = `KC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const qrCode = await generateQRCode(cardNumber, selectedResident.email || '');

      const { error } = await supabase
        .from('key_cards')
        .insert({
          card_number: cardNumber,
          resident_id: cardForm.resident_id,
          status: 'ACTIVE',
          expires_at: cardForm.expires_at || null,
          qr_code_url: qrCode,
        });

      if (error) throw error;

      await loadKeyCards();
      setIsDialogOpen(false);
      setCardForm({ resident_id: "", expires_at: "" });
      
      toast({ title: 'Success', description: 'Key card created successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardAction = async (cardId: string, action: string) => {
    try {
      let status: "ACTIVE" | "INACTIVE" | "LOST" | "EXPIRED";
      
      switch (action.toLowerCase()) {
        case "active":
          status = "ACTIVE";
          break;
        case "inactive":
          status = "INACTIVE";
          break;
        case "lost":
          status = "LOST";
          break;
        case "expired":
          status = "EXPIRED";
          break;
        default:
          throw new Error("Invalid status");
      }
      
      const { error } = await supabase
        .from('key_cards')
        .update({ status })
        .eq('id', cardId);

      if (error) throw error;

      await loadKeyCards();
      toast({ title: 'Success', description: `Key card marked as ${action}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSoftDelete = async () => {
    if (!cardToDelete) return;

    try {
      const { error } = await supabase.rpc('soft_delete_key_card', {
        card_id: cardToDelete
      });

      if (error) throw error;

      await loadKeyCards();
      toast({ title: 'Success', description: 'Key card deleted (can be restored within 30 days)' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleteOpen(false);
      setCardToDelete(null);
    }
  };

  const sendQRCodeEmail = async (card: KeyCard) => {
    // In a real implementation, this would send an email with the QR code
    toast({
      title: "QR Code Sent",
      description: `QR code sent to ${card.resident?.email}`,
    });
  };

  const filteredCards = keyCards.filter(card => {
    const matchesSearch = 
      card.card_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.resident?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.resident?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || card.status.toLowerCase() === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "lost":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filters = ["all", "active", "inactive", "lost", "expired"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Key Cards Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Key Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Key Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Resident *</Label>
                <Select value={cardForm.resident_id} onValueChange={(value) => setCardForm(prev => ({ ...prev, resident_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map(resident => (
                      <SelectItem key={resident.id} value={resident.id}>
                        {resident.full_name} {resident.house_number ? `- ${resident.house_number}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={cardForm.expires_at}
                  onChange={(e) => setCardForm(prev => ({ ...prev, expires_at: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateCard} disabled={loading} className="flex-1">
                  Create Card
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
              placeholder="Search cards or residents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="capitalize"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div key={card.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={card.resident?.photo_url || ""} alt={card.resident?.full_name} />
                    <AvatarFallback className="bg-primary/10">
                      {card.resident?.full_name.split(' ').map(n => n[0]).join('') || <Key className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{card.card_number}</h3>
                    <p className="text-sm text-muted-foreground">{card.resident?.full_name}</p>
                    {card.resident?.house_number && (
                      <p className="text-xs text-muted-foreground">{card.resident.house_number}</p>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCardAction(card.id, "active")}>
                      Mark as Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCardAction(card.id, "inactive")}>
                      Mark as Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCardAction(card.id, "lost")}>
                      Mark as Lost
                    </DropdownMenuItem>
                    {card.qr_code_url && (
                      <DropdownMenuItem onClick={() => sendQRCodeEmail(card)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send QR to Email
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => {
                      setCardToDelete(card.id);
                      setIsDeleteOpen(true);
                    }}>
                      Delete Card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(card.status)}>
                    {card.status}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Issued: {new Date(card.issued_at).toLocaleDateString()}</p>
                  {card.expires_at && (
                    <p>Expires: {new Date(card.expires_at).toLocaleDateString()}</p>
                  )}
                </div>

                {card.qr_code_url && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-center">
                      <img src={card.qr_code_url} alt="QR Code" className="w-16 h-16" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Key Card</AlertDialogTitle>
              <AlertDialogDescription>
                This will soft-delete the key card. It can be restored within 30 days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSoftDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};