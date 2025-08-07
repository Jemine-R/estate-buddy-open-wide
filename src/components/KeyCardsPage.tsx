import { useState } from "react";
import { Search, Plus, MoreHorizontal, QrCode, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

// Get residents from localStorage
const getResidents = () => {
  const saved = localStorage.getItem('residents');
  return saved ? JSON.parse(saved) : [];
};

export const KeyCardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  
  // Load key cards from localStorage
  const getKeyCards = () => {
    const saved = localStorage.getItem('keyCards');
    const defaultCards = [
      { id: "KC-1234", name: "John Doe", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "Expires over 1 year ago", email: "john.doe@example.com", rentalStatus: "Paid", photo: null, qrCode: null },
      { id: "KC-5678", name: "Jane Smith", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "", email: "jane.smith@example.com", rentalStatus: "Paid", photo: null, qrCode: null },
      { id: "KC-9012", name: "Robert Johnson", status: "INACTIVE", statusColor: "bg-gray-100 text-gray-800", issued: "Issued almost 3 years ago", expires: "Expired almost 3 years ago", email: "robert.j@example.com", rentalStatus: "Overdue", photo: null, qrCode: null },
      { id: "KC-3456", name: "Maria Garcia", status: "LOST", statusColor: "bg-red-100 text-red-800", issued: "Issued about 2 years ago", expires: "", email: "maria.g@example.com", rentalStatus: "Due Soon", photo: null, qrCode: null },
      { id: "KC-7890", name: "David Wilson", status: "EXPIRED", statusColor: "bg-orange-100 text-orange-800", issued: "Issued almost 3 years ago", expires: "Expired almost 2 years ago", email: "david.w@example.com", rentalStatus: "Paid", photo: null, qrCode: null },
    ];
    return saved ? JSON.parse(saved) : defaultCards;
  };

  const [keyCards, setKeyCards] = useState(getKeyCards());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResidentDialogOpen, setIsResidentDialogOpen] = useState(false);
  const [selectedResidentForCard, setSelectedResidentForCard] = useState("");
  const [residentSearchQuery, setResidentSearchQuery] = useState("");
  const [newCard, setNewCard] = useState({ selectedResidentId: "", rentalStatus: "" });
  const { toast } = useToast();

  const tabs = ["All", "Active", "Inactive", "Lost", "Expired"];

  const filteredCards = keyCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         card.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || card.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });


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
    if (!newCard.selectedResidentId || !newCard.rentalStatus) {
      toast({
        title: "Error",
        description: "Please select a resident and rental status",
        variant: "destructive",
      });
      return;
    }

    const residents = getResidents();
    const selectedResident = residents.find(r => r.id === newCard.selectedResidentId);
    
    if (!selectedResident) {
      toast({
        title: "Error",
        description: "Selected resident not found",
        variant: "destructive",
      });
      return;
    }

    const newId = `KC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const qrCode = await generateQRCode(newId, selectedResident.email);
    
    const cardToAdd = {
      id: newId,
      name: selectedResident.name,
      email: selectedResident.email,
      houseNumber: selectedResident.houseNumber,
      rentalStatus: newCard.rentalStatus,
      status: "ACTIVE" as const,
      statusColor: "bg-green-100 text-green-800",
      issued: `Issued today`,
      expires: "",
      qrCode
    };

    const updatedCards = [...keyCards, cardToAdd];
    setKeyCards(updatedCards);
    
    // Save to localStorage
    localStorage.setItem('keyCards', JSON.stringify(updatedCards));
    
    setNewCard({ selectedResidentId: "", rentalStatus: "" });
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
          case "active":
            return { ...card, status: "ACTIVE", statusColor: "bg-green-100 text-green-800" };
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

    setNewCard(prev => ({ 
      ...prev, 
      selectedResidentId: selectedResidentForCard
    }));
    setIsResidentDialogOpen(false);
    setSelectedResidentForCard("");
    setResidentSearchQuery("");
  };

  const sendQRCodeEmail = (card: any) => {
    toast({
      title: "QR Code Sent",
      description: `QR code sent to ${card.email}`,
    });
  };

  const residents = getResidents();
  const filteredResidents = residents.filter(resident =>
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
                <Label htmlFor="resident">Select Resident *</Label>
                <Select value={newCard.selectedResidentId} onValueChange={(value) => setNewCard(prev => ({ ...prev, selectedResidentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map(resident => (
                      <SelectItem key={resident.id} value={resident.id}>
                        {resident.name} - {resident.houseNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Resident Details Dialog for Key Cards */}
      <Dialog open={isResidentDialogOpen} onOpenChange={setIsResidentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
          </DialogHeader>
          {selectedResidentForCard && (
            (() => {
              const residents = getResidents();
              const resident = residents.find(r => r.id === selectedResidentForCard);
              const card = keyCards.find(c => c.name === resident?.name);
              
              if (!resident) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-semibold text-blue-600">
                      {resident.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{resident.name}</h2>
                      <p className="text-gray-600">{resident.email}</p>
                      <p className="text-sm text-gray-500">{resident.houseNumber}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p>{resident.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Occupation:</span>
                      <p>{resident.occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Key Card Status:</span>
                      <Badge className={resident.keyCardStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {resident.keyCardStatus}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Resident Since:</span>
                      <p>{resident.residentSince || 'N/A'}</p>
                    </div>
                  </div>

                  {card?.qrCode && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-medium mb-2">QR Code</h3>
                      <div className="flex justify-center">
                        <img src={card.qrCode} alt="QR Code" className="w-32 h-32" />
                      </div>
                      <Button 
                        className="w-full mt-2" 
                        onClick={() => {
                          toast({
                            title: "QR Code Sent",
                            description: `QR code sent to ${resident.email}`,
                          });
                        }}
                      >
                        Send QR Code to Email
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>
      
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
                <div 
                  className="cursor-pointer"
                  onClick={() => {
                    const residents = getResidents();
                    const resident = residents.find(r => r.name === card.name);
                    if (resident) {
                      // Create a dialog to show resident details with QR code
                      const residentWithQR = { ...resident, qrCode: card.qrCode };
                      setSelectedResidentForCard(resident.id);
                      setIsResidentDialogOpen(true);
                    }
                  }}
                >
                  <h3 className="font-semibold text-black">{card.id}</h3>
                  {card.houseNumber && <p className="text-xs text-gray-500">{card.houseNumber}</p>}
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
                  <DropdownMenuItem onClick={() => handleCardAction(card.id, "active")}>
                    Mark as Active
                  </DropdownMenuItem>
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
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
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
                <div className="flex justify-center">
                  <img src={card.qrCode} alt="QR Code" className="w-24 h-24" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};