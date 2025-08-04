import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
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