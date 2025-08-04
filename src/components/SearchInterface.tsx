import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoginModal } from "./LoginModal";

export const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes("estate buddy")) {
      setShowLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Property Management Search
          </h1>
          <p className="text-muted-foreground text-lg">
            Search for property management systems and platforms
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Try searching for 'Estate Buddy'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-search-bg border-search-border"
            />
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Hint: Type "Estate Buddy" to access the property management system</p>
        </div>
      </div>

      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
    </div>
  );
};