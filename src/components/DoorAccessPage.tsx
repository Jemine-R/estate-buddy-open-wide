import { useState } from "react";
import { Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const DoorAccessPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const doorLocations = [
    { name: "Main Entrance", location: "Ground Floor", status: "Closed", statusColor: "bg-gray-500", time: "32 minutes ago" },
    { name: "Building A", location: "East Wing", status: "Open", statusColor: "bg-green-500", time: "14 minutes ago" },
    { name: "Garage", location: "Basement", status: "Locked", statusColor: "bg-blue-500", time: "about 2 hours ago" },
    { name: "Pool Area", location: "Recreational Zone", status: "Maintenance", statusColor: "bg-orange-500", time: "about 6 hours ago" },
    { name: "Building B", location: "West Wing", status: "Closed", statusColor: "bg-blue-500", time: "about 1 hour ago" },
    { name: "Gym", location: "Recreational Zone", status: "Open", statusColor: "bg-green-500", time: "17 minutes ago" },
    { name: "Conference Room", location: "Building A", status: "Locked", statusColor: "bg-blue-500", time: "about 3 hours ago" },
    { name: "Storage Room", location: "Basement", status: "Closed", statusColor: "bg-blue-500", time: "about 4 hours ago" },
  ];

  const filteredLocations = doorLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-black mb-6">Door Access Control</h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search doors or locations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full max-w-md bg-gray-50 border-gray-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-black">{location.name}</h3>
                <p className="text-sm text-gray-500">{location.location}</p>
              </div>
              <div className={`w-8 h-8 ${location.statusColor} rounded flex items-center justify-center`}>
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
            </div>
            
            <div className="mb-4">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                location.status === 'Open' ? 'bg-green-100 text-green-800' :
                location.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                location.status === 'Locked' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {location.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{location.time}</span>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};