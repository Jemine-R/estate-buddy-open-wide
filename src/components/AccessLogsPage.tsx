import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const AccessLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const { toast } = useToast();

  const accessLogs = [
    { time: "Aug 5, 2025 5:14 AM", resident: "Jane Smith", action: "DENIED", actionColor: "bg-red-100 text-red-800", location: "Building B", cardId: "KC-2752" },
    { time: "Aug 5, 2025 12:03 AM", resident: "Robert Johnson", action: "EXIT", actionColor: "bg-blue-100 text-blue-800", location: "Garage", cardId: "KC-7856" },
    { time: "Aug 4, 2025 10:49 PM", resident: "Jane Smith", action: "REGISTERED", actionColor: "bg-purple-100 text-purple-800", location: "Gym", cardId: "KC-7142" },
    { time: "Aug 4, 2025 6:05 AM", resident: "Jane Smith", action: "REGISTERED", actionColor: "bg-purple-100 text-purple-800", location: "Building A", cardId: "KC-9883" },
    { time: "Aug 3, 2025 6:22 PM", resident: "Jane Smith", action: "ENTRY", actionColor: "bg-green-100 text-green-800", location: "Garage", cardId: "KC-7185" },
    { time: "Aug 3, 2025 10:10 AM", resident: "Sarah Brown", action: "REGISTERED", actionColor: "bg-purple-100 text-purple-800", location: "Gym", cardId: "KC-7076" },
    { time: "Aug 3, 2025 9:11 AM", resident: "Sarah Brown", action: "DENIED", actionColor: "bg-red-100 text-red-800", location: "Building A", cardId: "KC-2294" },
    { time: "Aug 3, 2025 5:40 AM", resident: "John Doe", action: "DENIED", actionColor: "bg-red-100 text-red-800", location: "Main Entrance", cardId: "KC-7206" },
    { time: "Aug 2, 2025 10:41 PM", resident: "John Doe", action: "ENTRY", actionColor: "bg-green-100 text-green-800", location: "Building B", cardId: "KC-5493" },
  ];

  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = log.resident.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.cardId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "All Actions" || log.action === actionFilter;
    const matchesLocation = locationFilter === "All Locations" || log.location === locationFilter;
    return matchesSearch && matchesAction && matchesLocation;
  });

  const handleExportLogs = () => {
    // Create CSV content
    const csvContent = [
      ["Time", "Resident", "Action", "Location", "Card ID"],
      ...filteredLogs.map(log => [log.time, log.resident, log.action, log.location, log.cardId])
    ].map(row => row.join(",")).join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Access logs have been downloaded as CSV file.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Access Logs</h1>
        <Button onClick={handleExportLogs} className="bg-black text-white hover:bg-gray-800">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by resident or card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Actions">All Actions</SelectItem>
            <SelectItem value="ENTRY">ENTRY</SelectItem>
            <SelectItem value="EXIT">EXIT</SelectItem>
            <SelectItem value="DENIED">DENIED</SelectItem>
            <SelectItem value="REGISTERED">REGISTERED</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Locations">All Locations</SelectItem>
            <SelectItem value="Building A">Building A</SelectItem>
            <SelectItem value="Building B">Building B</SelectItem>
            <SelectItem value="Garage">Garage</SelectItem>
            <SelectItem value="Gym">Gym</SelectItem>
            <SelectItem value="Main Entrance">Main Entrance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Resident</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Card ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{log.time}</td>
                  <td className="py-3 px-4 text-sm font-medium text-blue-600">{log.resident}</td>
                  <td className="py-3 px-4">
                    <Badge className={`${log.actionColor}`}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.cardId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};