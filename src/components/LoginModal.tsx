import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the dashboard content
    const dashboardHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estate Buddy Dashboard</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #fafafa;
              color: #1a1a1a;
            }
            .container { display: flex; min-height: 100vh; }
            .sidebar { 
              width: 200px; 
              background: white; 
              border-right: 1px solid #e5e5e5; 
              padding: 20px;
            }
            .logo { 
              display: flex; 
              align-items: center; 
              gap: 8px; 
              font-weight: bold; 
              font-size: 18px;
              margin-bottom: 30px;
            }
            .nav-item { 
              padding: 12px 0; 
              cursor: pointer; 
              border-radius: 4px;
              margin-bottom: 4px;
            }
            .nav-item:hover { background: #f5f5f5; }
            .nav-item.active { background: #f5f5f5; font-weight: 500; }
            .main { flex: 1; padding: 20px; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 30px;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .stat-card { 
              background: white; 
              padding: 24px; 
              border-radius: 8px; 
              border: 1px solid #e5e5e5;
            }
            .stat-number { 
              font-size: 32px; 
              font-weight: bold; 
              margin-bottom: 8px;
            }
            .stat-label { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 8px;
            }
            .stat-change { 
              font-size: 12px; 
              color: #16a34a;
            }
            .activity-section { 
              background: white; 
              border-radius: 8px; 
              border: 1px solid #e5e5e5; 
              padding: 24px;
            }
            .activity-header { 
              font-weight: 600; 
              margin-bottom: 20px;
            }
            .activity-placeholder { 
              height: 200px; 
              background: #f9f9f9; 
              border-radius: 4px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: #666;
            }
            .user-avatar { 
              width: 32px; 
              height: 32px; 
              background: #1a1a1a; 
              color: white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold;
            }
            .globe-icon { 
              width: 24px; 
              height: 24px; 
              border: 2px solid #1a1a1a; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="sidebar">
              <div class="logo">
                <div class="globe-icon">🌐</div>
                <span>Estate Buddy</span>
              </div>
              <div class="nav-item active">Dashboard</div>
              <div class="nav-item">🚪 Door Access</div>
              <div class="nav-item">Key Cards</div>
              <div class="nav-item">Access Log</div>
              <div class="nav-item">Residents</div>
              <div class="nav-item">Settings</div>
            </div>
            <div class="main">
              <div class="header">
                <h1>Dashboard</h1>
                <div class="user-avatar">A</div>
              </div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Total Residents</div>
                  <div class="stat-number">300</div>
                  <div class="stat-change">+5 this week</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Door</div>
                  <div class="stat-number">25</div>
                  <div class="stat-change">🔑</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Active Key Cards</div>
                  <div class="stat-number">205</div>
                  <div class="stat-change">12 new free</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Today's Activity</div>
                  <div class="stat-number">100</div>
                  <div class="stat-change">+50% vs yesterday</div>
                </div>
              </div>
              <div class="activity-section">
                <div class="activity-header">Recent Activity</div>
                <div class="activity-placeholder">
                  Activity logs will appear here
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Open dashboard in new window
    const newWindow = window.open("", "_blank", "width=1200,height=800");
    if (newWindow) {
      newWindow.document.write(dashboardHTML);
      newWindow.document.close();
    }
    
    onClose();
    setUsername("");
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-login-bg">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Estate Buddy</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-6">Sign In</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="sr-only">Username/Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username/Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-secondary text-center"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-secondary text-center"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              Login
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};