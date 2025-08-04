import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";

export const LoginPage = () => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-center gap-32">
          {/* Left side - Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center">
              <Globe className="h-10 w-10 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-black">Estate Buddy</h1>
          </div>

          {/* Right side - Sign In Form */}
          <div className="w-80">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-gray-700">Sign In</h2>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username/Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 bg-gray-300 border-0 rounded-md text-black placeholder:text-gray-600 text-center"
                required
              />
              
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-gray-300 border-0 rounded-md text-black placeholder:text-gray-600 text-center"
                required
              />
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="bg-black text-white px-8 py-2 rounded-md hover:bg-gray-800 font-medium"
                >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};