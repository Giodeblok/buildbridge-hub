import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Settings } from "lucide-react";

const MS_TOKEN_KEY = "msproject_token";
const AUTOCAD_TOKEN_KEY = "autocad_token";
const REVIT_TOKEN_KEY = "revit_token";

const Integrations = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [msConnected, setMsConnected] = useState(false);
  const [autocadConnected, setAutocadConnected] = useState(false);
  const [revitConnected, setRevitConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      fetch(`http://localhost:4000/user/tools?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setSelectedTools(data.tools || []));
    } else {
      const saved = localStorage.getItem('selectedTools');
      if (saved) setSelectedTools(JSON.parse(saved));
    }
    setMsConnected(!!localStorage.getItem(MS_TOKEN_KEY));
    setAutocadConnected(!!localStorage.getItem(AUTOCAD_TOKEN_KEY));
    setRevitConnected(!!localStorage.getItem(REVIT_TOKEN_KEY));

    // OAuth token listener
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.msproject_token) {
        localStorage.setItem(MS_TOKEN_KEY, event.data.msproject_token);
        setMsConnected(true);
      }
      if (event.data && event.data.autocad_token) {
        localStorage.setItem(AUTOCAD_TOKEN_KEY, event.data.autocad_token);
        setAutocadConnected(true);
      }
      if (event.data && event.data.revit_token) {
        localStorage.setItem(REVIT_TOKEN_KEY, event.data.revit_token);
        setRevitConnected(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleMsConnect = () => {
    window.open("http://localhost:4000/msproject/auth", "_blank", "width=500,height=700");
  };
  const handleAutocadConnect = () => {
    window.open("http://localhost:4000/autocad/auth", "_blank", "width=500,height=700");
  };
  const handleRevitConnect = () => {
    window.open("http://localhost:4000/revit/auth", "_blank", "width=500,height=700");
  };

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
        {/* MS Project koppeling alleen tonen als geselecteerd */}
        {selectedTools.includes('msproject') && (
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2">MS Project koppeling</h2>
            {msConnected ? (
              <span className="text-green-600">Gekoppeld</span>
            ) : (
              <Button onClick={handleMsConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
                Koppel MS Project
              </Button>
            )}
          </div>
        )}
        {/* AutoCAD koppeling alleen tonen als geselecteerd */}
        {selectedTools.includes('autocad') && (
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2">AutoCAD koppeling</h2>
            {autocadConnected ? (
              <span className="text-green-600">Gekoppeld</span>
            ) : (
              <Button onClick={handleAutocadConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
                Koppel AutoCAD
              </Button>
            )}
          </div>
        )}
        {/* Revit koppeling alleen tonen als geselecteerd */}
        {selectedTools.includes('revit') && (
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2">Revit koppeling</h2>
            {revitConnected ? (
              <span className="text-green-600">Gekoppeld</span>
            ) : (
              <Button onClick={handleRevitConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
                Koppel Revit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrations;