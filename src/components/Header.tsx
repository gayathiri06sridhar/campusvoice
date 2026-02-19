import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 md:py-5 flex items-center justify-between gap-4">
        <Link to="/" className="group">
          <h1 className="font-heading text-xl sm:text-2xl md:text-[1.75rem] font-medium text-foreground tracking-tight">
            CampusVoice Diaries
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Home
          </Link>
          <Link 
            to="/contact" 
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Contact
          </Link>
          <Link 
            to="/admin" 
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            Write
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-3 animate-fade-in">
          <Link 
            to="/" 
            className="block text-foreground font-body py-3 hover:text-muted-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/contact" 
            className="block text-muted-foreground font-body py-3 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          <Link 
            to="/admin" 
            className="block text-muted-foreground font-body py-3 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Write
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
