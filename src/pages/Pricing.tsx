import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "99",
      period: "per maand",
      description: "Perfect voor kleine bouwbedrijven",
      popular: false,
      features: [
        "Tot 3 tool integraties",
        "5 actieve projecten",
        "Basis dashboard",
        "Email ondersteuning",
        "Nederlandse servers",
        "AVG-compliant"
      ]
    },
    {
      name: "Professional",
      price: "249",
      period: "per maand",
      description: "Ideaal voor groeiende bedrijven",
      popular: true,
      features: [
        "Tot 8 tool integraties",
        "Onbeperkte projecten",
        "Geavanceerd dashboard",
        "Realtime synchronisatie",
        "Prioriteit ondersteuning",
        "Custom rapportages",
        "API toegang",
        "Teamcollaboratie"
      ]
    },
    {
      name: "Enterprise",
      price: "Op maat",
      period: "",
      description: "Voor grote organisaties",
      popular: false,
      features: [
        "Alle tool integraties",
        "Onbeperkte projecten",
        "White-label oplossing",
        "Dedicated account manager",
        "24/7 telefoon support",
        "Custom ontwikkeling",
        "Advanced security",
        "SLA garanties"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
              <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-construction-primary mb-4">
            Transparante Prijzen
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kies het abonnement dat het beste bij jouw bedrijf past. 
            Alle plannen bevatten een 30-dagen geld-terug-garantie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative hover:shadow-lg transition-shadow ${
                plan.popular ? 'ring-2 ring-construction-primary scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-construction-primary">
                  Meest Populair
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-construction-primary">
                    {plan.price === "Op maat" ? plan.price : `€${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.price === "Op maat" ? "Contact opnemen" : "30 dagen gratis proberen"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Veelgestelde Vragen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Kan ik later upgraden of downgraden?</h3>
                <p className="text-muted-foreground text-sm">
                  Ja, je kunt op elk moment je abonnement wijzigen. Wijzigingen gaan direct in.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Worden mijn data veilig opgeslagen?</h3>
                <p className="text-muted-foreground text-sm">
                  Alle data wordt opgeslagen op Nederlandse servers en is AVG-compliant.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is er een setup fee?</h3>
                <p className="text-muted-foreground text-sm">
                  Nee, alle plannen zijn zonder setup kosten. Je betaalt alleen het maandelijkse bedrag.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Krijg ik training en ondersteuning?</h3>
                <p className="text-muted-foreground text-sm">
                  Ja, bij elk abonnement krijg je toegang tot onze knowledge base en email support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;