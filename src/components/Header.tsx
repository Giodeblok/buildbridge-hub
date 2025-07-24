import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Building2 className="text-construction-primary" size={32} />
            <span className="text-xl font-bold text-construction-primary">
              BouwConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-construction-primary transition-colors">
              Integraties
            </a>
            <a href="#dashboard" className="text-foreground hover:text-construction-primary transition-colors">
              Dashboard
            </a>
            <a href="#pricing" className="text-foreground hover:text-construction-primary transition-colors">
              Prijzen
            </a>
            <a href="#contact" className="text-foreground hover:text-construction-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">
              Inloggen
            </Button>
            <Button variant="construction">
              Gratis proberen
            </Button>
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
              <a href="#features" className="text-foreground hover:text-construction-primary transition-colors">
                Integraties
              </a>
              <a href="#dashboard" className="text-foreground hover:text-construction-primary transition-colors">
                Dashboard
              </a>
              <a href="#pricing" className="text-foreground hover:text-construction-primary transition-colors">
                Prijzen
              </a>
              <a href="#contact" className="text-foreground hover:text-construction-primary transition-colors">
                Contact
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm">
                  Inloggen
                </Button>
                <Button variant="construction" size="sm">
                  Gratis proberen
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;