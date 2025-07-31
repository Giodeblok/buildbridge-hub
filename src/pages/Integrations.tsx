import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Settings, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const MS_TOKEN_KEY = "msproject_token";
const AUTOCAD_TOKEN_KEY = "autocad_token";
const ASTA_TOKEN_KEY = "asta_token";
const REVIT_TOKEN_KEY = "revit_token";
const SOLIBRI_TOKEN_KEY = "solibri_token";
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
  const [solibriConnected, setSolibriConnected] = useState(false);
  const [excelConnected, setExcelConnected] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState<{ open: boolean, toolId: string | null }>({ open: false, toolId: null });
  const { toast } = useToast();

  // State voor disconnected tools
  const [disconnectedTools, setDisconnectedTools] = useState<string[]>([]);

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
    setSolibriConnected(!!localStorage.getItem(SOLIBRI_TOKEN_KEY));
    setExcelConnected(!!localStorage.getItem(EXCEL_TOKEN_KEY));
    setWhatsappConnected(!!localStorage.getItem(WHATSAPP_TOKEN_KEY));

    // OAuth token listener
    const handler = async (event: MessageEvent) => {
      if (event.data && event.data.msproject_token) {
        localStorage.setItem(MS_TOKEN_KEY, event.data.msproject_token);
        await handleSuccessfulAuth(
          'msproject', 
          event.data.msproject_token, 
          event.data.msproject_refresh_token, 
          event.data.msproject_expires_in
        );
      }
      if (event.data && event.data.autocad_token) {
        localStorage.setItem(AUTOCAD_TOKEN_KEY, event.data.autocad_token);
        await handleSuccessfulAuth(
          'autocad', 
          event.data.autocad_token, 
          event.data.autocad_refresh_token, 
          event.data.autocad_expires_in
        );
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
      if (event.data && event.data.solibri_token) {
        localStorage.setItem(SOLIBRI_TOKEN_KEY, event.data.solibri_token);
        setSolibriConnected(true);
        
        // Sla token op in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch('http://localhost:4000/user/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              toolId: 'solibri',
              accessToken: event.data.solibri_token,
              refreshToken: event.data.solibri_refresh_token || null,
              expiresIn: event.data.solibri_expires_in || 3600
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

  // Helper functie om tool te koppelen na succesvolle authenticatie
  const handleSuccessfulAuth = async (toolId: string, token: string, refreshToken?: string, expiresIn?: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Sla token op in database
      await fetch(`${baseUrl}/user/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          toolId: toolId,
          accessToken: token,
          refreshToken: refreshToken || null,
          expiresIn: expiresIn || 3600
        })
      });

      // Voeg tool toe aan user_tools tabel
      await supabase
        .from('user_tools')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Update integration status
      await supabase
        .from('integration_status')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          is_connected: true,
          sync_status: 'connected',
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    // Voeg tool toe aan selectedTools als deze er nog niet in zit
    if (!selectedTools.includes(toolId)) {
      const newSelectedTools = [...selectedTools, toolId];
      setSelectedTools(newSelectedTools);
      localStorage.setItem('selectedTools', JSON.stringify(newSelectedTools));
    }

    // Verwijder uit disconnectedTools state
    setDisconnectedTools(prev => prev.filter(id => id !== toolId));

    // Update connection status
    switch(toolId) {
      case 'msproject': setMsConnected(true); break;
      case 'autocad': setAutocadConnected(true); break;
      case 'asta': setAstaConnected(true); break;
      case 'revit': setRevitConnected(true); break;
      case 'solibri': setSolibriConnected(true); break;
      case 'excel': setExcelConnected(true); break;
      case 'whatsapp': setWhatsappConnected(true); break;
    }

    const toolNames = {
      'msproject': 'MS Project',
      'autocad': 'AutoCAD',
      'asta': 'Asta Powerproject',
      'revit': 'Revit',
      'solibri': 'Solibri',
      'excel': 'Excel',
      'whatsapp': 'WhatsApp'
    };

    toast({
      title: `${toolNames[toolId as keyof typeof toolNames]} gekoppeld`,
      description: `${toolNames[toolId as keyof typeof toolNames]} is succesvol gekoppeld aan je account.`,
    });
  };

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
  const handleSolibriConnect = () => {
    window.open(`${baseUrl}/solibri/auth`, "_blank", "width=500,height=700");
  };
  const handleExcelConnect = () => {
    window.open(`${baseUrl}/excel/auth`, "_blank", "width=500,height=700");
  };
  const handleWhatsappConnect = () => {
    window.open(`${baseUrl}/whatsapp/auth`, "_blank", "width=500,height=700");
  };

  const removeTokenForTool = (toolId: string) => {
    switch (toolId) {
      case 'msproject': localStorage.removeItem(MS_TOKEN_KEY); break;
      case 'autocad': localStorage.removeItem(AUTOCAD_TOKEN_KEY); break;
      case 'asta': localStorage.removeItem(ASTA_TOKEN_KEY); break;
      case 'revit': localStorage.removeItem(REVIT_TOKEN_KEY); break;
      case 'solibri': localStorage.removeItem(SOLIBRI_TOKEN_KEY); break;
      case 'excel': localStorage.removeItem(EXCEL_TOKEN_KEY); break;
      case 'whatsapp': localStorage.removeItem(WHATSAPP_TOKEN_KEY); break;
    }
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

  // Functie om tool te ontkoppelen (tool blijft in overzicht)
  const handleDisconnectTool = async (toolId: string) => {
    // Verwijder de token uit localStorage
    switch (toolId) {
      case 'msproject': localStorage.removeItem(MS_TOKEN_KEY); break;
      case 'autocad': localStorage.removeItem(AUTOCAD_TOKEN_KEY); break;
      case 'asta': localStorage.removeItem(ASTA_TOKEN_KEY); break;
      case 'revit': localStorage.removeItem(REVIT_TOKEN_KEY); break;
      case 'solibri': localStorage.removeItem(SOLIBRI_TOKEN_KEY); break;
      case 'excel': localStorage.removeItem(EXCEL_TOKEN_KEY); break;
      case 'whatsapp': localStorage.removeItem(WHATSAPP_TOKEN_KEY); break;
    }

    // Verwijder alleen de koppeling uit de user_tools tabel
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_tools')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId);
      
      // Update ook de integration_status naar disconnected
      await supabase
        .from('integration_status')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          is_connected: false,
          sync_status: 'disconnected',
          updated_at: new Date().toISOString()
        });
    }

    // Voeg tool toe aan disconnectedTools state
    setDisconnectedTools(prev => [...prev, toolId]);

    toast({
      title: "Tool ontkoppeld",
      description: `${toolId} is ontkoppeld. Je moet opnieuw authenticeren om de tool te koppelen.`,
    });
  };

  // Functie om tool te verwijderen (alleen ontkoppelen, token behouden)
  const handleRemoveTool = async (toolId: string) => {
    const isConnected = integrationStatus.find(i => i.id === toolId)?.isConnected;
    const newSelectedTools = selectedTools.filter(id => id !== toolId);
    setSelectedTools(newSelectedTools);
    localStorage.setItem('selectedTools', JSON.stringify(newSelectedTools));
    
    // NIET de token verwijderen - alleen ontkoppelen van het scherm
    // if (isConnected) removeTokenForTool(toolId); // Deze regel verwijderen
    
    // Verwijder alleen de koppeling uit de user_tools tabel
    // De oauth_tokens blijven behouden
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_tools')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId);
      
      // Update ook de integration_status naar disconnected
      await supabase
        .from('integration_status')
        .upsert({
          user_id: user.id,
          tool_id: toolId,
          is_connected: false,
          sync_status: 'disconnected',
          updated_at: new Date().toISOString()
        });
    }
  };

  // Functie om tool opnieuw te koppelen
  const handleReconnectTool = async (toolId: string) => {
    // Start altijd de authenticatie flow, ongeacht of er een token bestaat
    toast({
      title: "Authenticatie vereist",
      description: `Je moet ${toolId} opnieuw authenticeren.`,
    });
    
    // Start authenticatie flow
    switch(toolId) {
      case 'msproject': handleMsConnect(); break;
      case 'autocad': handleAutocadConnect(); break;
      case 'asta': handleAstaConnect(); break;
      case 'revit': handleRevitConnect(); break;
      case 'solibri': handleSolibriConnect(); break;
      case 'excel': handleExcelConnect(); break;
      case 'whatsapp': handleWhatsappConnect(); break;
    }
  };

  // Functie om token handmatig toe te voegen voor specifiek e-mailadres
  const addTokenForEmail = async (email: string, toolId: string, token: string) => {
    try {
      // Voor nu gebruiken we een eenvoudigere aanpak
      // In productie zou je dit via een admin API endpoint doen
      
      // Voeg token toe aan localStorage voor de huidige gebruiker
      // (Dit is een tijdelijke oplossing - in productie zou je dit via backend doen)
      
      const tokenKey = (() => {
        switch(toolId) {
          case 'autocad': return AUTOCAD_TOKEN_KEY;
          case 'msproject': return MS_TOKEN_KEY;
          case 'asta': return ASTA_TOKEN_KEY;
          case 'revit': return REVIT_TOKEN_KEY;
          case 'solibri': return SOLIBRI_TOKEN_KEY;
          case 'excel': return EXCEL_TOKEN_KEY;
          case 'whatsapp': return WHATSAPP_TOKEN_KEY;
          default: return null;
        }
      })();

      if (!tokenKey) {
        toast({
          title: "Ongeldige tool",
          description: `Tool ${toolId} wordt niet ondersteund.`,
          variant: "destructive",
        });
        return;
      }

      // Voeg token toe aan localStorage
      localStorage.setItem(tokenKey, token);

      // Voeg tool toe aan selectedTools als deze er nog niet in zit
      if (!selectedTools.includes(toolId)) {
        const newSelectedTools = [...selectedTools, toolId];
        setSelectedTools(newSelectedTools);
        localStorage.setItem('selectedTools', JSON.stringify(newSelectedTools));
      }

      // Sla op in database voor huidige gebruiker
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Voeg token toe aan oauth_tokens tabel
        await supabase
          .from('oauth_tokens')
          .upsert({
            user_id: user.id,
            tool_id: toolId,
            access_token: token,
            expires_in: 3600, // 1 uur (standaard)
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        // Voeg tool toe aan user_tools tabel
        await supabase
          .from('user_tools')
          .upsert({
            user_id: user.id,
            tool_id: toolId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        // Update integration status
        await supabase
          .from('integration_status')
          .upsert({
            user_id: user.id,
            tool_id: toolId,
            is_connected: true,
            sync_status: 'connected',
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      toast({
        title: "Token toegevoegd",
        description: `AutoCAD token succesvol toegevoegd voor ${email}`,
      });

      console.log(`Token toegevoegd voor ${email} - Tool: ${toolId}`);

    } catch (error) {
      console.error('Error in addTokenForEmail:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het toevoegen van de token.",
        variant: "destructive",
      });
    }
  };

  // Functie om AutoCAD token toe te voegen voor giodeblok@gmail.com
  const addAutocadTokenForGiodeblok = () => {
    // Vervang dit met de daadwerkelijke AutoCAD token
    const autocadToken = "YOUR_AUTOCAD_TOKEN_HERE";
    
    if (autocadToken === "YOUR_AUTOCAD_TOKEN_HERE") {
      toast({
        title: "Token vereist",
        description: "Vervang 'YOUR_AUTOCAD_TOKEN_HERE' met de daadwerkelijke AutoCAD token.",
        variant: "destructive",
      });
      return;
    }

    addTokenForEmail("giodeblok@gmail.com", "autocad", autocadToken);
  };

  const integrationStatus = selectedTools.map(toolId => {
    // Check of tool is gemarkeerd als disconnected
    const isDisconnected = disconnectedTools.includes(toolId);
    
    const isConnected = isDisconnected ? false : (() => {
      switch(toolId) {
        case 'msproject': return msConnected;
        case 'autocad': return autocadConnected;
        case 'asta': return astaConnected;
        case 'revit': return revitConnected;
        case 'solibri': return solibriConnected;
        case 'excel': return excelConnected;
        case 'whatsapp': return whatsappConnected;
        default: return Math.random() > 0.3;
      }
    })();
    
    return {
      id: toolId,
      name: toolId.charAt(0).toUpperCase() + toolId.slice(1),
      status: isConnected ? 'connected' : 'error',
      lastSync: new Date(Date.now() - Math.random() * 3600000).toLocaleString('nl-NL'),
      dataPoints: Math.floor(Math.random() * 1000) + 100,
      isConnected
    };
  });

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
                    
                    <div className="space-y-2">
                      {!integration.isConnected ? (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleReconnectTool(integration.id)}
                        >
                          Koppelen
                        </Button>
                      ) : integration.status === 'error' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleReconnectTool(integration.id)}
                        >
                          Opnieuw verbinden
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={() => handleDisconnectTool(integration.id)}
                        >
                          Ontkoppelen
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => setConfirmUnlink({ open: true, toolId: integration.id })}
                      >
                        Verwijderen uit overzicht
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
        {confirmUnlink.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                Weet je zeker dat je deze tool uit je overzicht wilt verwijderen?
              </h2>
              <p className="mb-6">
                Deze tool wordt uit je overzicht verwijderd. Je kunt hem later altijd weer toevoegen.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmUnlink({ open: false, toolId: null })}>Annuleren</Button>
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    if (confirmUnlink.toolId) await handleRemoveTool(confirmUnlink.toolId);
                    setConfirmUnlink({ open: false, toolId: null });
                  }}
                >
                  Verwijderen
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