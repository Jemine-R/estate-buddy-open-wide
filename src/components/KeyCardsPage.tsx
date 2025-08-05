import { useState } from "react";
import { Search, Plus, MoreHorizontal, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const KeyCardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [keyCards, setKeyCards] = useState([
    { id: "KC-1234", name: "John Doe", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "Expires over 1 year ago", email: "john.doe@example.com", rentalStatus: "Paid", photo: null },
    { id: "KC-5678", name: "Jane Smith", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "", email: "jane.smith@example.com", rentalStatus: "Paid", photo: null },
    { id: "KC-9012", name: "Robert Johnson", status: "INACTIVE", statusColor: "bg-gray-100 text-gray-800", issued: "Issued almost 3 years ago", expires: "Expired almost 3 years ago", email: "robert.j@example.com", rentalStatus: "Overdue", photo: null },
    { id: "KC-3456", name: "Maria Garcia", status: "LOST", statusColor: "bg-red-100 text-red-800", issued: "Issued about 2 years ago", expires: "", email: "maria.g@example.com", rentalStatus: "Due Soon", photo: null },
    { id: "KC-7890", name: "David Wilson", status: "EXPIRED", statusColor: "bg-orange-100 text-orange-800", issued: "Issued almost 3 years ago", expires: "Expired almost 2 years ago", email: "david.w@example.com", rentalStatus: "Paid", photo: null },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleCreateCard = () => {
    if (!newCard.name || !newCard.email || !newCard.rentalStatus) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newId = `KC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const cardToAdd = {
      id: newId,
      name: newCard.name,
      email: newCard.email,
      rentalStatus: newCard.rentalStatus,
      photo: newCard.photo,
      status: "ACTIVE" as const,
      statusColor: "bg-green-100 text-green-800",
      issued: `Issued today`,
      expires: ""
    };

    setKeyCards(prev => [...prev, cardToAdd]);
    setNewCard({ name: "", email: "", rentalStatus: "", photo: null });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "New key card created successfully",
    });
  };

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
                <Input
                  id="name"
                  value={newCard.name}
                  onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter resident name"
                />
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
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
          </div>
        ))}
      </div>
    </div>
  );
};