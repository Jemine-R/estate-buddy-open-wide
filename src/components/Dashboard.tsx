import { useState } from "react";
import { Search, LogOut, ChevronLeft, LayoutDashboard, DoorOpen, CreditCard, FileText, Users, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Add search functionality here
  };

  const sidebarItems = [
    { name: "Dashboard", active: true, icon: LayoutDashboard },
    { name: "Door Access", active: false, icon: DoorOpen },
    { name: "Key Cards", active: false, icon: CreditCard },
    { name: "Access Log", active: false, icon: FileText },
    { name: "Residents", active: false, icon: Users },
    { name: "Settings", active: false, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-48'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-xs">
                🌐
              </div>
              {!sidebarCollapsed && <span className="font-semibold text-black">Estate Buddy</span>}
            </div>
            <ChevronLeft 
              className={`h-4 w-4 cursor-pointer transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <div
                key={item.name}
                className={`px-3 py-2 text-sm cursor-pointer rounded flex items-center gap-3 ${
                  item.active 
                    ? "bg-gray-100 font-medium text-black" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-black">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 h-8 bg-gray-50 border-gray-200"
                />
              </form>

              {/* User Avatar with Logout Popup */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer text-sm font-medium">
                    A
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-2" align="end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-2">Total Residents</div>
              <div className="text-3xl font-bold text-black mb-2">300</div>
              <div className="text-xs text-green-600">+5 this week</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-2">Door</div>
              <div className="text-3xl font-bold text-black mb-2">25</div>
              <div className="text-xs text-gray-500">🔑</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-2">Active Key Cards</div>
              <div className="text-3xl font-bold text-black mb-2">205</div>
              <div className="text-xs text-gray-500">12 new free</div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-2">Today's Activity</div>
              <div className="text-3xl font-bold text-black mb-2">100</div>
              <div className="text-xs text-green-600">+50% vs yesterday</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Recent Activity</h3>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
              Activity logs will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};