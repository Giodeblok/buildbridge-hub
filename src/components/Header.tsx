import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginDialog from "./LoginDialog";
import TrialDialog from "./TrialDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Building2 className="text-construction-primary" size={32} />
            <span className="text-xl font-bold text-construction-primary">
              BouwConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/integraties')} 
              className="text-foreground hover:text-construction-primary transition-colors"
            >
              Integraties
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-foreground hover:text-construction-primary transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/prijzen')} 
              className="text-foreground hover:text-construction-primary transition-colors"
            >
              Prijzen
            </button>
            <button 
              onClick={() => navigate('/contact')} 
              className="text-foreground hover:text-construction-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LoginDialog>
              <Button variant="ghost">
                Inloggen
              </Button>
            </LoginDialog>
            <TrialDialog>
              <Button variant="construction">
                Gratis proberen
              </Button>
            </TrialDialog>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="flex flex-col space-y-4 p-4">
              <button 
                onClick={() => navigate('/integraties')} 
                className="text-foreground hover:text-construction-primary transition-colors text-left"
              >
                Integraties
              </button>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-foreground hover:text-construction-primary transition-colors text-left"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/prijzen')} 
                className="text-foreground hover:text-construction-primary transition-colors text-left"
              >
                Prijzen
              </button>
              <button 
                onClick={() => navigate('/contact')} 
                className="text-foreground hover:text-construction-primary transition-colors text-left"
              >
                Contact
              </button>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <LoginDialog>
                  <Button variant="ghost" size="sm">
                    Inloggen
                  </Button>
                </LoginDialog>
                <TrialDialog>
                  <Button variant="construction" size="sm">
                    Gratis proberen
                  </Button>
                </TrialDialog>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;