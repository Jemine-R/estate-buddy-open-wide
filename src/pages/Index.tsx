import { LoginPage } from "@/components/LoginPage";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div>
      <LoginPage />
      <div className="text-center mt-4">
        <Link to="/auth" className="underline">Go to secure Login / Sign up</Link>
      </div>
    </div>
  );
};

export default Index;
