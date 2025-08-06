import { useState } from "react";
import { Search, Plus, MoreHorizontal, Upload, X, QrCode, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

// Mock residents data (in real app, this would come from a global state or API)
const mockResidents = [
  { id: "R-001", name: "John Doe", email: "john.doe@example.com" },
  { id: "R-002", name: "Jane Smith", email: "jane.smith@example.com" },
  { id: "R-003", name: "Robert Johnson", email: "robert.j@example.com" },
  { id: "R-004", name: "Maria Garcia", email: "maria.g@example.com" },
  { id: "R-005", name: "David Wilson", email: "david.w@example.com" },
];

export const KeyCardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [keyCards, setKeyCards] = useState([
    { id: "KC-1234", name: "John Doe", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "Expires over 1 year ago", email: "john.doe@example.com", rentalStatus: "Paid", photo: null, qrCode: null },
    { id: "KC-5678", name: "Jane Smith", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "", email: "jane.smith@example.com", rentalStatus: "Paid", photo: null, qrCode: null },
    { id: "KC-9012", name: "Robert Johnson", status: "INACTIVE", statusColor: "bg-gray-100 text-gray-800", issued: "Issued almost 3 years ago", expires: "Expired almost 3 years ago", email: "robert.j@example.com", rentalStatus: "Overdue", photo: null, qrCode: null },
    { id: "KC-3456", name: "Maria Garcia", status: "LOST", statusColor: "bg-red-100 text-red-800", issued: "Issued about 2 years ago", expires: "", email: "maria.g@example.com", rentalStatus: "Due Soon", photo: null, qrCode: null },
    { id: "KC-7890", name: "David Wilson", status: "EXPIRED", statusColor: "bg-orange-100 text-orange-800", issued: "Issued almost 3 years ago", expires: "Expired almost 2 years ago", email: "david.w@example.com", rentalStatus: "Paid", photo: null, qrCode: null },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [selectedResidentForCard, setSelectedResidentForCard] = useState("");
  const [residentSearchQuery, setResidentSearchQuery] = useState("");
  const [newCard, setNewCard] = useState({ name: "", email: "", rentalStatus: "", photo: null as string | null });
  const { toast } = useToast();

  const tabs = ["All", "Active", "Inactive", "Lost", "Expired"];

  const filteredCards = keyCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         card.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || card.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCard(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
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
    if (!newCard.name || !newCard.email || !newCard.rentalStatus) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newId = `KC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const qrCode = await generateQRCode(newId, newCard.email);
    
    const cardToAdd = {
      id: newId,
      name: newCard.name,
      email: newCard.email,
      rentalStatus: newCard.rentalStatus,
      photo: newCard.photo,
      status: "ACTIVE" as const,
      statusColor: "bg-green-100 text-green-800",
      issued: `Issued today`,
      expires: "",
      qrCode
    };

    setKeyCards(prev => [...prev, cardToAdd]);
    setNewCard({ name: "", email: "", rentalStatus: "", photo: null });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "New key card created successfully with QR code",
    });
  };

  const handleCardAction = (cardId: string, action: string) => {
    setKeyCards(prev => prev.map(card => {
      if (card.id === cardId) {
        switch (action) {
          case "inactive":
            return { ...card, status: "INACTIVE", statusColor: "bg-gray-100 text-gray-800" };
          case "lost":
            return { ...card, status: "LOST", statusColor: "bg-red-100 text-red-800" };
          default:
            return card;
        }
      }
      return card;
    }));
    
    toast({
      title: "Success",
      description: `Key card marked as ${action}`,
    });
  };

  const handleLinkResident = () => {
    if (!selectedResidentForCard) {
      toast({
        title: "Error",
        description: "Please select a resident",
        variant: "destructive",
      });
      return;
    }

    const resident = mockResidents.find(r => r.id === selectedResidentForCard);
    if (resident) {
      setNewCard(prev => ({ 
        ...prev, 
        name: resident.name, 
        email: resident.email 
      }));
      setIsResidentDialogOpen(false);
      setSelectedResidentForCard("");
      setResidentSearchQuery("");
    }
  };

  const sendQRCodeEmail = (card: any) => {
    toast({
      title: "QR Code Sent",
      description: `QR code sent to ${card.email}`,
    });
  };

  const filteredResidents = mockResidents.filter(resident =>
    resident.name.toLowerCase().includes(residentSearchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(residentSearchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Key Cards</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Register New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Key Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={newCard.name}
                    onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter resident name"
                    className="flex-1"
                  />
                  <Dialog open={isResidentDialogOpen} onOpenChange={setIsResidentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button">
                        Link Resident
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Resident</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search residents..."
                            value={residentSearchQuery}
                            onChange={(e) => setResidentSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {filteredResidents.map(resident => (
                            <div
                              key={resident.id}
                              onClick={() => setSelectedResidentForCard(resident.id)}
                              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                                selectedResidentForCard === resident.id ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                            >
                              <div className="font-medium">{resident.name}</div>
                              <div className="text-sm text-gray-500">{resident.email}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsResidentDialogOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handleLinkResident} className="flex-1 bg-black text-white hover:bg-gray-800">
                            Link Selected
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCard.email}
                  onChange={(e) => setNewCard(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="rentalStatus">Rental Status *</Label>
                <Select value={newCard.rentalStatus} onValueChange={(value) => setNewCard(prev => ({ ...prev, rentalStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rental status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Due Soon">Due Soon</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="photo">Passport Photograph</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
                  {newCard.photo && (
                    <div className="flex items-center gap-2">
                      <img src={newCard.photo} alt="Preview" className="w-12 h-12 rounded object-cover" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewCard(prev => ({ ...prev, photo: null }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateCard} className="flex-1 bg-black text-white hover:bg-gray-800">
                  Create Card
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search cards or residents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
        
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-black text-white" : "text-gray-600"}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-black">{card.id}</h3>
                  <p className="text-sm text-gray-600">{card.name}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => handleCardAction(card.id, "inactive")}>
                    Mark as Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCardAction(card.id, "lost")}>
                    Mark as Lost
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                    Register New Keycard
                  </DropdownMenuItem>
                  {card.qrCode && (
                    <DropdownMenuItem onClick={() => sendQRCodeEmail(card)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send QR to Email
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mb-4">
              <Badge className={`${card.statusColor}`}>
                {card.status}
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-gray-500">
              <p>{card.issued}</p>
              {card.expires && <p>{card.expires}</p>}
            </div>
            
            {card.qrCode && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-blue-500">QR Code Available</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendQRCodeEmail(card)}
                  className="text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Send
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};