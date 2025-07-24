import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Settings } from "lucide-react";

const Integrations = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedTools');
    if (saved) {
      setSelectedTools(JSON.parse(saved));
    }
  }, []);

  const integrationStatus = selectedTools.map(toolId => ({
    id: toolId,
    name: toolId.charAt(0).toUpperCase() + toolId.slice(1),
    status: Math.random() > 0.3 ? 'connected' : 'error',
    lastSync: new Date(Date.now() - Math.random() * 3600000).toLocaleString('nl-NL'),
    dataPoints: Math.floor(Math.random() * 1000) + 100
  }));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-construction-primary mb-4">
            Mijn Integraties
          </h1>
          <p className="text-lg text-muted-foreground">
            Overzicht van al je gekoppelde tools en hun status
          </p>
        </div>

        {selectedTools.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Geen tools geselecteerd</h3>
              <p className="text-muted-foreground mb-6">
                Ga naar tool selectie om je eerste integraties in te stellen.
              </p>
              <Button onClick={() => window.location.href = '/tool-selection'}>
                Tools selecteren
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationStatus.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge 
                      variant={integration.status === 'connected' ? 'default' : 'destructive'}
                    >
                      {integration.status === 'connected' ? 'Verbonden' : 'Fout'}
                    </Badge>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Laatste sync: {integration.lastSync}</p>
                      <p>Data punten: {integration.dataPoints}</p>
                    </div>
                    
                    {integration.status === 'error' && (
                      <Button variant="outline" size="sm" className="w-full">
                        Opnieuw verbinden
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrations;