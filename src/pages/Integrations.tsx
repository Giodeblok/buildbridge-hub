import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Settings, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MS_TOKEN_KEY = "msproject_token";
const AUTOCAD_TOKEN_KEY = "autocad_token";
const ASTA_TOKEN_KEY = "asta_token";
const REVIT_TOKEN_KEY = "revit_token";
const EXCEL_TOKEN_KEY = "excel_token";
const WHATSAPP_TOKEN_KEY = "whatsapp_token";

// Beschikbare tools voor toevoeging
const availableTools = [
  { id: "excel", name: "Excel", description: "Spreadsheets en calculaties", icon: "📊" },
  { id: "msproject", name: "MS Project", description: "Projectplanning en tijdlijnen", icon: "📅" },
  { id: "exact", name: "Exact", description: "Financiële administratie", icon: "💰" },
  { id: "whatsapp", name: "WhatsApp", description: "Communicatie en berichten", icon: "💬" },
  { id: "asta", name: "Asta Powerproject", description: "Geavanceerde projectplanning", icon: "📋" },
  { id: "revit", name: "Autodesk Revit", description: "BIM modeling en 3D ontwerp", icon: "🏗️" },
  { id: "solibri", name: "Solibri", description: "BIM kwaliteitscontrole", icon: "✅" },
  { id: "autocad", name: "AutoCAD", description: "2D/3D CAD tekeningen", icon: "✏️" },
  { id: "bluebeam", name: "Bluebeam Revu", description: "PDF markup en samenwerking", icon: "📄" },
  { id: "afas", name: "AFAS", description: "ERP systeem", icon: "🏢" },
];

const Integrations = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [msConnected, setMsConnected] = useState(false);
  const [autocadConnected, setAutocadConnected] = useState(false);
  const [astaConnected, setAstaConnected] = useState(false);
  const [revitConnected, setRevitConnected] = useState(false);
  const [excelConnected, setExcelConnected] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);

  useEffect(() => {
    const loadUserTools = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Haal tools op uit Supabase database
        const { data: toolsData } = await supabase
          .from('user_tools')
          .select('tool_id')
          .eq('user_id', user.id);
        
        if (toolsData) {
          setSelectedTools(toolsData.map(tool => tool.tool_id));
        }
      } else {
        // Fallback naar localStorage voor niet-ingelogde gebruikers
        const saved = localStorage.getItem('selectedTools');
        if (saved) setSelectedTools(JSON.parse(saved));
      }
    };

    loadUserTools();
    setMsConnected(!!localStorage.getItem(MS_TOKEN_KEY));
    setAutocadConnected(!!localStorage.getItem(AUTOCAD_TOKEN_KEY));
    setAstaConnected(!!localStorage.getItem(ASTA_TOKEN_KEY));
    setRevitConnected(!!localStorage.getItem(REVIT_TOKEN_KEY));
    setExcelConnected(!!localStorage.getItem(EXCEL_TOKEN_KEY));
    setWhatsappConnected(!!localStorage.getItem(WHATSAPP_TOKEN_KEY));

    // OAuth token listener
    const handler = async (event: MessageEvent) => {
      if (event.data && event.data.msproject_token) {
        localStorage.setItem(MS_TOKEN_KEY, event.data.msproject_token);
        setMsConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch(`${baseUrl}/user/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'msproject',
              accessToken: event.data.msproject_token,
              refreshToken: event.data.msproject_refresh_token || null,
              expiresIn: event.data.msproject_expires_in || 3600
            })
          });
        }
      }
      if (event.data && event.data.autocad_token) {
        localStorage.setItem(AUTOCAD_TOKEN_KEY, event.data.autocad_token);
        setAutocadConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch(`${baseUrl}/user/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'autocad',
              accessToken: event.data.autocad_token,
              refreshToken: event.data.autocad_refresh_token || null,
              expiresIn: event.data.autocad_expires_in || 3600
            })
          });
        }
      }
      if (event.data && event.data.asta_token) {
        localStorage.setItem(ASTA_TOKEN_KEY, event.data.asta_token);
        setAstaConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch('http://localhost:4000/user/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'asta',
              accessToken: event.data.asta_token,
              refreshToken: event.data.asta_refresh_token || null,
              expiresIn: event.data.asta_expires_in || 3600
            })
          });
        }
      }
      if (event.data && event.data.revit_token) {
        localStorage.setItem(REVIT_TOKEN_KEY, event.data.revit_token);
        setRevitConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch('http://localhost:4000/user/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'revit',
              accessToken: event.data.revit_token,
              refreshToken: event.data.revit_refresh_token || null,
              expiresIn: event.data.revit_expires_in || 3600
            })
          });
        }
      }
      if (event.data && event.data.excel_token) {
        localStorage.setItem(EXCEL_TOKEN_KEY, event.data.excel_token);
        setExcelConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch('http://localhost:4000/user/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'excel',
              accessToken: event.data.excel_token,
              refreshToken: event.data.excel_refresh_token || null,
              expiresIn: event.data.excel_expires_in || 3600
            })
          });
        }
      }
      if (event.data && event.data.whatsapp_token) {
        localStorage.setItem(WHATSAPP_TOKEN_KEY, event.data.whatsapp_token);
        setWhatsappConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch('http://localhost:4000/user/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'whatsapp',
              accessToken: event.data.whatsapp_token,
              refreshToken: event.data.whatsapp_refresh_token || null,
              expiresIn: event.data.whatsapp_expires_in || 3600
            })
          });
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-app-name.vercel.app/api' 
    : 'http://localhost:4000';

  const handleMsConnect = () => {
    window.open(`${baseUrl}/msproject/auth`, "_blank", "width=500,height=700");
  };
  const handleAutocadConnect = () => {
    window.open(`${baseUrl}/autocad/auth`, "_blank", "width=500,height=700");
  };
  const handleAstaConnect = () => {
    window.open(`${baseUrl}/asta/auth`, "_blank", "width=500,height=700");
  };
  const handleRevitConnect = () => {
    window.open(`${baseUrl}/revit/auth`, "_blank", "width=500,height=700");
  };
  const handleExcelConnect = () => {
    window.open(`${baseUrl}/excel/auth`, "_blank", "width=500,height=700");
  };
  const handleWhatsappConnect = () => {
    window.open(`${baseUrl}/whatsapp/auth`, "_blank", "width=500,height=700");
  };

  // Functie om tool toe te voegen
  const handleAddTool = async (toolId: string) => {
    if (!selectedTools.includes(toolId)) {
      const newSelectedTools = [...selectedTools, toolId];
      setSelectedTools(newSelectedTools);
      localStorage.setItem('selectedTools', JSON.stringify(newSelectedTools));
      
      // Sla op in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_tools')
          .insert({
            user_id: user.id,
            tool_id: toolId
          });
      }
    }
  };

  // Functie om tool te verwijderen
  const handleRemoveTool = async (toolId: string) => {
    const newSelectedTools = selectedTools.filter(id => id !== toolId);
    setSelectedTools(newSelectedTools);
    localStorage.setItem('selectedTools', JSON.stringify(newSelectedTools));
    
    // Verwijder uit database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_tools')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId);
    }
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
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-construction-primary mb-4">
              Mijn Integraties
            </h1>
            <p className="text-lg text-muted-foreground">
              Overzicht van al je gekoppelde tools en hun status
            </p>
          </div>
          <Button 
            onClick={() => setShowAddMore(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Meer toevoegen
          </Button>
        </div>

        {selectedTools.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Geen tools geselecteerd</h3>
              <p className="text-muted-foreground mb-6">
                Voeg je eerste integraties toe om te beginnen.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowAddMore(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tools toevoegen
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/tool-selection'}>
                  Volledige selectie
                </Button>
              </div>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveTool(integration.id)}
                    >
                      Verwijderen
                    </Button>
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
        {/* Asta Powerproject koppeling alleen tonen als geselecteerd */}
        {selectedTools.includes('asta') && (
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2">Asta Powerproject koppeling</h2>
            {astaConnected ? (
              <span className="text-green-600">Gekoppeld</span>
            ) : (
              <Button onClick={handleAstaConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
                Koppel Asta Powerproject
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
        {/* Excel koppeling alleen tonen als geselecteerd */}
        {selectedTools.includes('excel') && (
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2">Excel koppeling</h2>
            {excelConnected ? (
              <span className="text-green-600">Gekoppeld</span>
            ) : (
              <Button onClick={handleExcelConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
                Koppel Excel
              </Button>
            )}
          </div>
        )}
        {/* WhatsApp koppeling alleen tonen als geselecteerd */}
        {selectedTools.includes('whatsapp') && (
          <div className="my-6">
            <h2 className="text-xl font-bold mb-2">WhatsApp koppeling</h2>
            {whatsappConnected ? (
              <span className="text-green-600">Gekoppeld</span>
            ) : (
              <Button onClick={handleWhatsappConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
                Koppel WhatsApp
              </Button>
            )}
          </div>
        )}

        {/* Meer toevoegen Modal */}
        {showAddMore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tools toevoegen</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddMore(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTools.map((tool) => {
                  const isSelected = selectedTools.includes(tool.id);
                  return (
                    <Card 
                      key={tool.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-construction-primary bg-construction-primary/5' : ''
                      }`}
                      onClick={() => isSelected ? handleRemoveTool(tool.id) : handleAddTool(tool.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          <Badge variant={isSelected ? 'default' : 'secondary'}>
                            {isSelected ? 'Toegevoegd' : 'Toevoegen'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowAddMore(false)}
                >
                  Sluiten
                </Button>
                <Button 
                  onClick={() => window.location.href = '/tool-selection'}
                >
                  Volledige tool selectie
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrations;