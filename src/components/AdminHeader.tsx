import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast.error(error.message || "Failed to sign out");
      } else {
        toast.success("Signed out successfully");
        // Clear any lingering auth state
        localStorage.removeItem("supabase.auth.token");
        // Navigate to login
        setTimeout(() => {
          navigate("/admin/login", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 max-w-4xl">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="group">
            <h1 className="font-heading text-lg md:text-xl font-medium text-foreground">
              Dashboard
            </h1>
          </Link>
          <Link 
            to="/" 
            className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
            target="_blank"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View site
          </Link>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout} 
          disabled={isSigningOut}
          className="font-body text-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
