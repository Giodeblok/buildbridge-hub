import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, Users, Clock } from "lucide-react";
import dashboardImage from "@/assets/dashboard-mockup.jpg";

const DashboardPreview = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Dashboard Image */}
          <div className="relative">
            <img 
              src={dashboardImage} 
              alt="Construction dashboard interface" 
              className="rounded-lg shadow-elevation-lg w-full"
            />
            
            {/* Floating cards for visual appeal */}
            <Card className="absolute -top-4 -right-4 w-48 shadow-elevation-lg bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-green-500" size={20} />
                  <div>
                    <div className="text-sm font-medium">Project A</div>
                    <div className="text-xs text-muted-foreground">85% voltooid</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="absolute -bottom-4 -left-4 w-40 shadow-elevation-lg bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-construction-accent" size={20} />
                  <div>
                    <div className="text-sm font-medium">3 meldingen</div>
                    <div className="text-xs text-muted-foreground">Vandaag</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-construction-primary mb-6">
              Alle projecten in één overzicht
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Van planning tot oplevering: zie direct waar elk project staat, 
              waar knelpunten zitten en wat er gedaan moet worden.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-construction-light p-2 rounded-lg">
                  <TrendingUp className="text-construction-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-construction-primary mb-1">
                    Realtime voortgang
                  </h3>
                  <p className="text-muted-foreground">
                    Automatische updates vanuit al je systemen
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-construction-light p-2 rounded-lg">
                  <Users className="text-construction-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-construction-primary mb-1">
                    Team communicatie
                  </h3>
                  <p className="text-muted-foreground">
                    WhatsApp berichten direct in je dashboard
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-construction-light p-2 rounded-lg">
                  <Clock className="text-construction-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-construction-primary mb-1">
                    Planning insights
                  </h3>
                  <p className="text-muted-foreground">
                    Directe koppeling met MS Project en Excel
                  </p>
                </div>
              </div>
            </div>
            
            <Button variant="construction" size="lg" className="text-lg px-8">
              Dashboard bekijken
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;