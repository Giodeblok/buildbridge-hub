import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-construction.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Construction technology integration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Verbind je 
          <span className="text-construction-accent"> bouwtools</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
          Het centrale platform dat Excel, MS Project, Exact en WhatsApp 
          eenvoudig koppelt voor realtime projectoverzicht
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="lg" className="text-lg px-8 py-3">
            Start je integratie
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-construction-primary">
            Bekijk demo
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm opacity-75">
          <span>AVG-compliant</span>
          <span>•</span>
          <span>Nederlandse server</span>
          <span>•</span>
          <span>24/7 support</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;