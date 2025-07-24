import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, TrendingDown, Zap, Smartphone } from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    title: "Minder administratie",
    description: "Tot 40% minder tijd aan administratieve taken door automatische synchronisatie",
    percentage: "40%"
  },
  {
    icon: CheckCircle,
    title: "Minder fouten",
    description: "Geen dubbel werk meer - alle data komt uit één bron",
    percentage: "85%"
  },
  {
    icon: Zap,
    title: "Sneller reageren",
    description: "Directe notificaties bij wijzigingen of problemen op de bouwplaats",
    percentage: "60%"
  },
  {
    icon: Smartphone,
    title: "Mobiel werken",
    description: "Volledige toegang vanaf elke locatie op elk apparaat",
    percentage: "100%"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-construction-primary mb-6">
            Meetbare resultaten
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Onze klanten zien direct resultaat in hun dagelijkse werkzaamheden. 
            Minder stress, meer overzicht, betere samenwerking.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center shadow-elevation hover:shadow-elevation-lg transition-all duration-300 border-none group">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-construction-light mb-6 group-hover:bg-construction-accent group-hover:text-white transition-all duration-300">
                  <benefit.icon size={32} className="text-construction-primary group-hover:text-white" />
                </div>
                
                <div className="text-4xl font-bold text-construction-accent mb-2">
                  {benefit.percentage}
                </div>
                
                <h3 className="text-xl font-semibold text-construction-primary mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground mb-4">
            Gebaseerd op data van 200+ bouwbedrijven die BouwConnect gebruiken
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;