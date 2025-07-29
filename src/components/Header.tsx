import { Button } from "@/components/ui/button";
import { Building2, Menu, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginDialog from "./LoginDialog";
import TrialDialog from "./TrialDialog";
import { supabase } from "@/lib/supabase";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Haal huidige gebruiker op
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Luister naar auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
    navigate('/');
  };

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
          <nav className="hidden md:flex items-center space-x-8">
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
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </Button>
              </div>
            ) : (
              <>
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
              </>
            )}
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
                {user ? (
                  <>
                    <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 font-medium">Ingelogd als: {user.email}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Uitloggen
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;