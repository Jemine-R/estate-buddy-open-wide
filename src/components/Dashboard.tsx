import { useState } from "react";
import { Search, LogOut, ChevronLeft, LayoutDashboard, DoorOpen, CreditCard, FileText, Users, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";
import { DoorAccessPage } from "./DoorAccessPage";
import { KeyCardsPage } from "./KeyCardsPage";
import { AccessLogsPage } from "./AccessLogsPage";
import { ResidentsPage } from "./ResidentsPage";
import { SettingsPage } from "./SettingsPage";
import { supabase } from "@/integrations/supabase/client";
import { UserManagementPage } from "./UserManagementPage";

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Global search functionality
    const query = searchQuery.toLowerCase();
    
    if (query.includes("settings") || query.includes("admin") || query.includes("password")) {
      setActivePage("Settings");
    } else if (query.includes("door") || query.includes("access") || query.includes("main entrance")) {
      setActivePage("Door Access");
    } else if (query.includes("keycard") || query.includes("key card") || query.includes("card")) {
      setActivePage("Key Cards");
    } else if (query.includes("resident") || query.includes("tenant")) {
      setActivePage("Residents");
    } else if (query.includes("log") || query.includes("activity")) {
      setActivePage("Access Log");
    } else if (query.includes("dashboard") || query.includes("home")) {
      setActivePage("Dashboard");
    }
    
    setSearchQuery("");
  };

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Door Access", icon: DoorOpen },
    { name: "Key Cards", icon: CreditCard },
    { name: "Access Log", icon: FileText },
    { name: "Residents", icon: Users },
    { name: "User Management", icon: Users },
    { name: "Settings", icon: Settings },
  ];

  const handlePageChange = (pageName: string) => {
    setActivePage(pageName);
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "Door Access":
        return <DoorAccessPage />;
      case "Key Cards":
        return <KeyCardsPage />;
      case "Access Log":
        return <AccessLogsPage />;
      case "Residents":
        return <ResidentsPage />;
      case "User Management":
        return <UserManagementPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return (
          <div className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-2">Total Residents</div>
                <div className="text-3xl font-bold text-black mb-2">300</div>
                <div className="text-xs text-green-600">+5 this week</div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-2">Active Key Cards</div>
                <div className="text-3xl font-bold text-black mb-2">205</div>
                <div className="text-xs text-blue-600">12 new issued</div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-2">Door Access Events</div>
                <div className="text-3xl font-bold text-black mb-2">847</div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-2">Rent Overdue</div>
                <div className="text-3xl font-bold text-red-600 mb-2">12</div>
                <div className="text-xs text-red-600">Needs attention</div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Recent Key Card Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm">New card issued to John Smith</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                    <span className="text-sm">Card KC-1234 marked as lost</span>
                    <span className="text-xs text-gray-500">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm">QR code sent to Maria Garcia</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Resident Status Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <span className="text-sm">15 residents with rent due soon</span>
                    <span className="text-xs text-yellow-600">Action needed</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm">3 new residents added this week</span>
                    <span className="text-xs text-green-600">Growing</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm">Door access configured for Block A</span>
                    <span className="text-xs text-blue-600">Updated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

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
                onClick={() => handlePageChange(item.name)}
                className={`px-3 py-2 text-sm cursor-pointer rounded flex items-center gap-3 ${
                  activePage === item.name 
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
              <h1 className="text-xl font-semibold text-black">{activePage}</h1>
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

              {/* Notification Bell */}
              <NotificationBell />

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

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
};