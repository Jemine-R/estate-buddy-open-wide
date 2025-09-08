import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "keycard" | "resident";
  message: string;
  time: string;
  read: boolean;
  created_at: string;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscriptions
    const keyCardsChannel = supabase
      .channel('key-cards-notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'key_cards' }, 
        () => loadNotifications()
      )
      .subscribe();

    const residentsChannel = supabase
      .channel('residents-notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'residents' }, 
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(keyCardsChannel);
      supabase.removeChannel(residentsChannel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const notifications: Notification[] = [];

      // Get recent key card activities
      const { data: keyCards } = await supabase
        .from('key_cards')
        .select(`
          id,
          card_number,
          status,
          issued_at,
          updated_at,
          residents!inner(full_name)
        `)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (keyCards) {
        keyCards.forEach(card => {
          notifications.push({
            id: `keycard-${card.id}`,
            type: "keycard",
            message: card.status === 'LOST' 
              ? `Key card ${card.card_number} status changed to LOST`
              : `New key card ${card.card_number} registered for ${(card.residents as any)?.full_name}`,
            time: formatDistanceToNow(new Date(card.updated_at), { addSuffix: true }),
            read: Math.random() > 0.5, // Random read status for demo
            created_at: card.updated_at
          });
        });
      }

      // Get recent resident activities  
      const { data: residents } = await supabase
        .from('residents')
        .select('id, full_name, house_number, created_at, updated_at')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (residents) {
        residents.forEach(resident => {
          notifications.push({
            id: `resident-${resident.id}`,
            type: "resident",
            message: `New resident ${resident.full_name} added${resident.house_number ? ` to ${resident.house_number}` : ''}`,
            time: formatDistanceToNow(new Date(resident.updated_at), { addSuffix: true }),
            read: Math.random() > 0.5, // Random read status for demo
            created_at: resident.updated_at
          });
        });
      }

      // Sort by creation time and take latest 6
      notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(notifications.slice(0, 6));

    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

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