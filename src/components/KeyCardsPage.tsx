import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const KeyCardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const keyCards = [
    { id: "KC-1234", name: "John Doe", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "Expires over 1 year ago" },
    { id: "KC-5678", name: "Jane Smith", status: "ACTIVE", statusColor: "bg-green-100 text-green-800", issued: "Issued over 2 years ago", expires: "" },
    { id: "KC-9012", name: "Robert Johnson", status: "INACTIVE", statusColor: "bg-gray-100 text-gray-800", issued: "Issued almost 3 years ago", expires: "Expired almost 3 years ago" },
    { id: "KC-3456", name: "Maria Garcia", status: "LOST", statusColor: "bg-red-100 text-red-800", issued: "Issued about 2 years ago", expires: "" },
    { id: "KC-7890", name: "David Wilson", status: "EXPIRED", statusColor: "bg-orange-100 text-orange-800", issued: "Issued almost 3 years ago", expires: "Expired almost 2 years ago" },
  ];

  const tabs = ["All", "Active", "Inactive", "Lost", "Expired"];

  const filteredCards = keyCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         card.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || card.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Key Cards</h1>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Register New Card
        </Button>
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