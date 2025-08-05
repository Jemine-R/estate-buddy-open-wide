import { useState } from "react";
import { Search, Plus, MoreHorizontal, Key, Mail, User, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const ResidentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const residents = [
    { 
      name: "John Doe", 
      apartment: "A-101", 
      email: "john.doe@example.com", 
      status: "Active", 
      statusColor: "bg-green-100 text-green-800", 
      keyCards: "1 key card",
      avatar: "JD",
      avatarColor: "bg-teal-500",
      residentSince: "15/06/2022",
      photo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Jane Smith", 
      apartment: "B-205", 
      email: "jane.smith@example.com", 
      status: "Active", 
      statusColor: "bg-green-100 text-green-800", 
      keyCards: "1 key card",
      avatar: "JS",
      avatarColor: "bg-teal-500",
      residentSince: "03/10/2021",
      photo: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face"
    },
    { 
      name: "Robert Johnson", 
      apartment: "A-304", 
      email: "robert.j@example.com", 
      status: "Inactive", 
      statusColor: "bg-gray-100 text-gray-800", 
      keyCards: "1 key card",
      avatar: "RJ",
      avatarColor: "bg-teal-500",
      residentSince: "20/03/2023"
    },
    { 
      name: "Maria Garcia", 
      apartment: "C-103", 
      email: "maria.g@example.com", 
      status: "New Resident", 
      statusColor: "bg-blue-100 text-blue-800", 
      keyCards: "1 key card",
      avatar: "MG",
      avatarColor: "bg-teal-500",
      residentSince: "08/11/2023"
    },
    { 
      name: "David Wilson", 
      apartment: "B-410", 
      email: "david.w@example.com", 
      status: "Active", 
      statusColor: "bg-green-100 text-green-800", 
      keyCards: "1 key card",
      avatar: "DW",
      avatarColor: "bg-teal-500",
      residentSince: "12/09/2022"
    },
    { 
      name: "Sarah Brown", 
      apartment: "A-201", 
      email: "sarah.b@example.com", 
      status: "Active", 
      statusColor: "bg-green-100 text-green-800", 
      keyCards: "No key cards",
      avatar: "SB",
      avatarColor: "bg-teal-500",
      residentSince: "17/05/2021"
    },
  ];

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.apartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddResident = () => {
    navigate("/add-resident");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Residents</h1>
        <Button onClick={handleAddResident} className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by name, apartment, or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full max-w-md bg-gray-50 border-gray-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResidents.map((resident, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {resident.photo ? (
                  <img src={resident.photo} alt={resident.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className={`w-10 h-10 ${resident.avatarColor} text-white rounded-full flex items-center justify-center font-medium`}>
                    {resident.avatar}
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-black">{resident.name}</h1>
                  <p className="text-sm text-gray-600">{resident.email}</p>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => toast({ title: "Access Restricted", description: `Access restricted for ${resident.name}` })}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Restrict Access
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Key className="h-4 w-4" />
                <span>{resident.keyCards}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge className={`${resident.statusColor}`}>
                {resident.status}
              </Badge>
              <span className="text-xs text-gray-400">Resident since {resident.residentSince}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};