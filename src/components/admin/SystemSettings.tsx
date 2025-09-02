import { useState, useEffect } from "react";
import { Settings, Activity, BarChart3, Users, Key, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SystemSettings = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    activeKeyCards: 0,
    todayAccess: 0,
    overdueRent: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSystemStats();
    loadRecentActivity();
  }, []);

  const loadSystemStats = async () => {
    try {
      const [residentsData, keyCardsData] = await Promise.all([
        supabase.from('residents').select('id, rent_status').is('deleted_at', null),
        supabase.from('key_cards').select('id, status').is('deleted_at', null),
      ]);

      const totalResidents = residentsData.data?.length || 0;
      const activeKeyCards = keyCardsData.data?.filter(card => card.status === 'ACTIVE').length || 0;
      const overdueRent = residentsData.data?.filter(resident => resident.rent_status === 'overdue').length || 0;

      setStats({
        totalResidents,
        activeKeyCards,
        todayAccess: Math.floor(Math.random() * 150) + 50, // Mock data for demo
        overdueRent,
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const loadRecentActivity = async () => {
    // Mock recent activity data - in a real app this would come from audit logs
    setRecentActivity([
      { id: 1, action: "New key card issued", user: "Admin", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: "keycard" },
      { id: 2, action: "Resident access restricted", user: "Admin", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), type: "security" },
      { id: 3, action: "New resident added", user: "Admin", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), type: "resident" },
      { id: 4, action: "Card KC-1234 marked as lost", user: "Admin", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: "keycard" },
    ]);
  };

  const handleSystemMaintenance = async (action: string) => {
    setLoading(true);
    try {
      // Mock system maintenance actions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({ 
        title: 'Success', 
        description: `${action} completed successfully` 
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "keycard":
        return <Key className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "resident":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "keycard":
        return "bg-blue-100 text-blue-800";
      case "security":
        return "bg-red-100 text-red-800";
      case "resident":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Residents</p>
                <p className="text-3xl font-bold">{stats.totalResidents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Key Cards</p>
                <p className="text-3xl font-bold">{stats.activeKeyCards}</p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Access</p>
                <p className="text-3xl font-bold">{stats.todayAccess}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Rent</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdueRent}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Performance</span>
                <span>95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span>99.8%</span>
              </div>
              <Progress value={99.8} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSystemMaintenance("Cache refresh")}
                disabled={loading}
              >
                Refresh System Cache
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSystemMaintenance("Database optimization")}
                disabled={loading}
              >
                Optimize Database
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSystemMaintenance("Security scan")}
                disabled={loading}
              >
                Run Security Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.user} • {activity.timestamp.toRelativeString?.() || activity.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Access Control</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Configure door access settings and permissions
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Notifications</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Set up email and SMS notifications
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Backup Settings</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Configure automatic data backups
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Security Policies</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Manage password and access policies
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Enable system maintenance mode
              </p>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Data Export</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export system data and reports
              </p>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};