import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const ResidentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get residents from localStorage
  const getResidents = () => {
    const saved = localStorage.getItem('residents');
    const defaultResidents = [
      { 
        id: "R-001", 
        name: "John Doe", 
        email: "john.doe@example.com", 
        keyCardStatus: "Active", 
        status: "paid", 
        residentSince: "Jan 2022",
        photo: null,
        houseNumber: "A-101",
        phone: "+1234567890",
        occupation: "Software Engineer"
      },
      { 
        id: "R-002", 
        name: "Jane Smith", 
        email: "jane.smith@example.com", 
        keyCardStatus: "Active", 
        status: "due-soon", 
        residentSince: "Mar 2022",
        photo: null,
        houseNumber: "B-205",
        phone: "+1234567891",
        occupation: "Teacher"
      },
      { 
        id: "R-003", 
        name: "Robert Johnson", 
        email: "robert.j@example.com", 
        keyCardStatus: "Inactive", 
        status: "overdue", 
        residentSince: "Dec 2021",
        photo: null,
        houseNumber: "C-303",
        phone: "+1234567892",
        occupation: "Doctor"
      },
      { 
        id: "R-004", 
        name: "Maria Garcia", 
        email: "maria.g@example.com", 
        keyCardStatus: "Active", 
        status: "paid", 
        residentSince: "Feb 2023",
        photo: null,
        houseNumber: "D-104",
        phone: "+1234567893",
        occupation: "Nurse"
      },
      { 
        id: "R-005", 
        name: "David Wilson", 
        email: "david.w@example.com", 
        keyCardStatus: "Active", 
        status: "paid", 
        residentSince: "Aug 2022",
        photo: null,
        houseNumber: "E-207",
        phone: "+1234567894",
        occupation: "Architect"
      }
    ];
    return saved ? JSON.parse(saved) : defaultResidents;
  };

  const residents = getResidents();

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleRestrictAccess = (residentName: string) => {
    toast({
      title: "Access Restricted",
      description: `Access has been restricted for ${residentName}`,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Residents</h1>
        <Button 
          onClick={() => navigate("/add-resident")}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search residents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResidents.map((resident) => (
          <div
            key={resident.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedResident(resident);
              setIsDialogOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={resident.photo || ""} alt={resident.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {resident.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold text-black">{resident.name}</h1>
                  <p className="text-sm text-gray-600">{resident.email}</p>
                </div>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestrictAccess(resident.name);
                    }}
                    className="w-full justify-start text-sm"
                  >
                    Restrict Access
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Key Card Status:</span>
                <Badge className={resident.keyCardStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {resident.keyCardStatus}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Rent Status:</span>
                <Badge className={getStatusColor(resident.status)}>
                  {getStatusText(resident.status)}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Resident since {resident.residentSince}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resident Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
          </DialogHeader>
          {selectedResident && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedResident.photo || ""} alt={selectedResident.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {selectedResident.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedResident.name}</h2>
                  <p className="text-gray-600">{selectedResident.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">House Number:</span>
                  <p>{selectedResident.houseNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p>{selectedResident.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Occupation:</span>
                  <p>{selectedResident.occupation || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Key Card Status:</span>
                  <Badge className={selectedResident.keyCardStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedResident.keyCardStatus}
                  </Badge>
                </div>
              </div>

              {selectedResident.qrCode && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium mb-2">QR Code</h3>
                  <div className="flex justify-center">
                    <img src={selectedResident.qrCode} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => {
                      toast({
                        title: "QR Code Sent",
                        description: `QR code sent to ${selectedResident.email}`,
                      });
                    }}
                  >
                    Send QR Code to Email
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};