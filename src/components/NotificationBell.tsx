import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export const NotificationBell = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: "keycard",
      message: "New key card KC-9876 registered for Maria Garcia",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "resident",
      message: "New resident David Wilson added to apartment B-410",
      time: "15 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "keycard",
      message: "Key card KC-5432 status changed to LOST",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 4,
      type: "resident",
      message: "Resident Sarah Brown updated contact information",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-black">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === "keycard" ? "bg-blue-500" : "bg-green-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-gray-200">
          <Button variant="ghost" size="sm" className="w-full text-sm">
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};