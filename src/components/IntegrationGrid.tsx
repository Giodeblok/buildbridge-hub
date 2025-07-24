import { Card, CardContent } from "@/components/ui/card";
import { Building2, FileSpreadsheet, MessageSquare, Calendar, Database, Shield, Layers, Box, CheckSquare, PenTool, FileText, Calculator } from "lucide-react";

const integrations = [
  {
    icon: FileSpreadsheet,
    name: "Excel",
    description: "Automatische synchronisatie van planning en voortgang",
    color: "text-green-600"
  },
  {
    icon: Calendar,
    name: "MS Project",
    description: "Realtime projectplanning en milestone tracking",
    color: "text-blue-600"
  },
  {
    icon: Database,
    name: "Exact",
    description: "Directe koppeling met financiële administratie",
    color: "text-red-600"
  },
  {
    icon: MessageSquare,
    name: "WhatsApp",
    description: "Bouwplaats communicatie in je dashboard",
    color: "text-green-500"
  },
  {
    icon: Building2,
    name: "BIM Viewers",
    description: "3D modellen integreren met projectdata",
    color: "text-construction-accent"
  },
  {
    icon: Shield,
    name: "Veiligheid",
    description: "Alle data blijft in je eigen systemen",
    color: "text-construction-primary"
  },
  {
    icon: Layers,
    name: "Asta Powerproject",
    description: "Geavanceerde projectplanning en resourcebeheer",
    color: "text-purple-600"
  },
  {
    icon: Box,
    name: "Autodesk Revit",
    description: "BIM modeling en 3D ontwerp integratie",
    color: "text-blue-500"
  },
  {
    icon: CheckSquare,
    name: "Solibri",
    description: "BIM kwaliteitscontrole en model checking",
    color: "text-orange-600"
  },
  {
    icon: PenTool,
    name: "AutoCAD",
    description: "2D/3D CAD tekeningen en technische plannen",
    color: "text-red-500"
  },
  {
    icon: FileText,
    name: "Bluebeam Revu",
    description: "PDF markup en digitale samenwerking",
    color: "text-blue-700"
  },
  {
    icon: Calculator,
    name: "AFAS",
    description: "ERP systeem voor financiën en personeelszaken",
    color: "text-green-700"
  }
];

const IntegrationGrid = () => {
  return (
    <section className="py-20 bg-construction-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-construction-primary mb-6">
            Koppel wat je al gebruikt
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Geen nieuwe software leren. Werk door met je vertrouwde tools, 
            maar dan slim gekoppeld en overzichtelijk in één dashboard.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration, index) => (
            <Card key={index} className="shadow-elevation hover:shadow-elevation-lg transition-all duration-300 hover:-translate-y-1 border-none">
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6 ${integration.color}`}>
                  <integration.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold text-construction-primary mb-3">
                  {integration.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {integration.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationGrid;