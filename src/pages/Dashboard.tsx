import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Clock, AlertTriangle, Calendar, Box, FileText, Euro, Bell, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const MS_TOKEN_KEY = "msproject_token";
const AUTOCAD_TOKEN_KEY = "autocad_token";
const REVIT_TOKEN_KEY = "revit_token";

const Dashboard = () => {
  const [msProjects, setMsProjects] = useState<any[]>([]);
  const [autocadProjects, setAutocadProjects] = useState<any[]>([]);
  const [revitProjects, setRevitProjects] = useState<any[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
  const msToken = localStorage.getItem(MS_TOKEN_KEY);
  const autocadToken = localStorage.getItem(AUTOCAD_TOKEN_KEY);
  const revitToken = localStorage.getItem(REVIT_TOKEN_KEY);

  useEffect(() => {
    // Real-time subscription voor project updates
    const subscription = supabase
      .channel('project-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_tools' }, 
        (payload) => {
          console.log('Real-time update:', payload);
          setRealTimeUpdates(prev => [...prev, payload]);
          
          // Refresh project data wanneer tools worden gewijzigd
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            // Herlaad project data
            loadProjectData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProjectData = async () => {
    if (msToken) {
      try {
        const res = await fetch("http://localhost:4000/msproject/projects", {
          headers: { Authorization: `Bearer ${msToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMsProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error loading MS Project data:', error);
      }
    }
    
    if (autocadToken) {
      try {
        const res = await fetch("http://localhost:4000/autocad/projects", {
          headers: { Authorization: `Bearer ${autocadToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAutocadProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error loading AutoCAD data:', error);
      }
    }
    
    if (revitToken) {
      try {
        const res = await fetch("http://localhost:4000/revit/projects", {
          headers: { Authorization: `Bearer ${revitToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRevitProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error loading Revit data:', error);
      }
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [msToken, autocadToken, revitToken]);

  // Combineer projecten
  const allProjects = [
    ...((msToken && msProjects.length > 0) ? msProjects : []),
    ...((autocadToken && autocadProjects.length > 0) ? autocadProjects : []),
    ...((revitToken && revitProjects.length > 0) ? revitProjects : [])
  ];

  // Mock data for integrated tools - in real app this would come from localStorage or API
  const integratedTools = ["MS Project", "Autodesk Revit", "AutoCAD", "Exact"];
  
  const mockData = {
    activeProjects: 12,
    totalBudget: 2840000,
    completionRate: 78,
    pendingTasks: 23,
    teamMembers: 45,
    overdueItems: 3
  };

  const currentProject = "Wooncomplex Amstelveen";

  const recentProjects = allProjects.length > 0 ? allProjects : [
    { name: "Wooncomplex Amstelveen", progress: 85, status: "on-track" },
    { name: "Kantoorgebouw Rotterdam", progress: 45, status: "delayed" },
    { name: "Renovatie School Utrecht", progress: 92, status: "ahead" },
    { name: "Sporthal Eindhoven", progress: 23, status: "on-track" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ahead': return 'Voor op schema';
      case 'delayed': return 'Vertraagd';
      default: return 'Op schema';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-construction-primary mb-4">
                Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Realtime overzicht van {currentProject}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select className="px-3 py-2 border rounded-md bg-background">
                <option>{currentProject}</option>
                <option>Kantoorgebouw Rotterdam</option>
                <option>Renovatie School Utrecht</option>
                <option>Sporthal Eindhoven</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Projecten</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                +2 deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Budget</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{(mockData.totalBudget / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">
                +8% t.o.v. vorig kwartaal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voortgang</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.completionRate}%</div>
              <Progress value={mockData.completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Openstaande Taken</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.pendingTasks}</div>
              <p className="text-xs text-red-600">
                {mockData.overdueItems} over deadline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tool-specific Dashboard Tabs */}
        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Modellen
            </TabsTrigger>
            <TabsTrigger value="drawings" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tekeningen
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Kosten
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Meldingen
            </TabsTrigger>
          </TabsList>

          {/* Planning Tab - MS Project & Asta Powerproject */}
          <TabsContent value="planning" className="space-y-6">
            {integratedTools.includes("MS Project") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    MS Project - Planning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-muted/50 rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Gantt Chart - Live Planning</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Taken & Resources</h4>
                      <div className="space-y-2">
                        <div className="p-3 border rounded">
                          <p className="font-medium text-sm">Fundering storten</p>
                          <p className="text-xs text-muted-foreground">Team A • Deadline: 15 feb</p>
                          <Progress value={75} className="mt-2 h-2" />
                        </div>
                        <div className="p-3 border rounded">
                          <p className="font-medium text-sm">Ruwbouw</p>
                          <p className="text-xs text-muted-foreground">Team B • Deadline: 28 feb</p>
                          <Progress value={30} className="mt-2 h-2" />
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm font-medium text-red-800">⚠️ Kritieke pad overschreden</p>
                        <p className="text-xs text-red-600">2 dagen vertraging verwacht</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {integratedTools.includes("Asta Powerproject") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Asta Powerproject - Bouwplanning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                          <span className="text-sm font-medium">Fundering</span>
                          <div className="w-32 bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm text-blue-700">85%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                          <span className="text-sm font-medium">Ruwbouw</span>
                          <div className="w-32 bg-orange-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm text-orange-700">45%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium">Afbouw</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-600 h-2 rounded-full" style={{width: '0%'}}></div>
                          </div>
                          <span className="text-sm text-gray-700">0%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium">🌤️ Weer vandaag</p>
                        <p className="text-xs">Droog, 15°C - Goed voor beton</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium">📦 Leveringen</p>
                        <p className="text-xs">Staal: 14 feb (op tijd)</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded">
                        <p className="text-sm font-medium">⚠️ Risico</p>
                        <p className="text-xs">Kraanpad mogelijk te smal</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Models Tab - Autodesk Revit */}
          <TabsContent value="models" className="space-y-6">
            {integratedTools.includes("Autodesk Revit") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    Autodesk Revit - BIM Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-muted/50 rounded-lg p-8 h-80 flex items-center justify-center border-2 border-dashed">
                        <div className="text-center">
                          <Box className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg font-medium mb-2">3D BIM Viewer</p>
                          <p className="text-sm text-muted-foreground">Klik op objecten voor eigenschappen</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Object Eigenschappen</h4>
                      <div className="p-3 border rounded">
                        <p className="font-medium text-sm">Draagbalk B-12</p>
                        <p className="text-xs text-muted-foreground">Materiaal: Staal S355</p>
                        <p className="text-xs text-muted-foreground">Leverancier: SteelCorp</p>
                        <Badge className="mt-2" variant="secondary">Geplaatst</Badge>
                      </div>
                      <h4 className="font-semibold">Recente Wijzigingen</h4>
                      <div className="space-y-2">
                        <div className="text-xs p-2 bg-blue-50 rounded">
                          <p className="font-medium">Wand W-45 toegevoegd</p>
                          <p className="text-muted-foreground">2 uur geleden</p>
                        </div>
                        <div className="text-xs p-2 bg-red-50 rounded">
                          <p className="font-medium">Clash gedetecteerd</p>
                          <p className="text-muted-foreground">Pijp vs. Balk niveau 2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Drawings Tab - AutoCAD & Bluebeam */}
          <TabsContent value="drawings" className="space-y-6">
            {integratedTools.includes("AutoCAD") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tekeningen & Documenten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Per Discipline</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left p-3 bg-blue-50 rounded hover:bg-blue-100">
                          <p className="font-medium text-sm">🏗️ Bouwkundig (8)</p>
                        </button>
                        <button className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100">
                          <p className="font-medium text-sm">⚡ Elektra (12)</p>
                        </button>
                        <button className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100">
                          <p className="font-medium text-sm">🚰 W&R (6)</p>
                        </button>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-medium text-green-800">📄 Nieuwe revisie</p>
                        <p className="text-xs text-green-600">Plattegrond BG beschikbaar</p>
                      </div>
                    </div>
                    <div className="lg:col-span-3">
                      <div className="bg-muted/50 rounded-lg p-8 h-64 flex items-center justify-center border-2 border-dashed">
                        <div className="text-center">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium mb-2">Document Viewer</p>
                          <p className="text-sm text-muted-foreground">Zoom, annotatie en markeertools</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Badge variant="outline">Revisie 3.2</Badge>
                        <Badge variant="outline">Goedgekeurd</Badge>
                        <Badge variant="outline">5 opmerkingen</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Costs Tab - Exact/AFAS */}
          <TabsContent value="costs" className="space-y-6">
            {integratedTools.includes("Exact") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Projectadministratie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Budget vs. Realisatie</h4>
                      <div className="bg-muted/50 rounded-lg p-6 h-48 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Financiële grafiek</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-sm font-medium">Budget</p>
                          <p className="text-lg font-bold text-green-700">€850.000</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="text-sm font-medium">Gerealiseerd</p>
                          <p className="text-lg font-bold text-blue-700">€723.500</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Recente Transacties</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium text-sm">Betonleverantie</p>
                            <p className="text-xs text-muted-foreground">Factuur #2024-0156</p>
                          </div>
                          <p className="font-medium">€15.750</p>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium text-sm">Kraanverhuur</p>
                            <p className="text-xs text-muted-foreground">Week 7-8</p>
                          </div>
                          <p className="font-medium">€8.400</p>
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-800">💰 Meerwerk niet geboekt</p>
                        <p className="text-xs text-red-600">Extra isolatiewerk €3.200</p>
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium text-yellow-800">📋 Factuur onvolledig</p>
                        <p className="text-xs text-yellow-600">BTW-nummer ontbreekt</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alle Meldingen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Kritieke vertraging planning</p>
                      <p className="text-sm text-red-600">MS Project: Kritieke pad overschreden - 2 dagen vertraging</p>
                      <p className="text-xs text-red-500 mt-1">5 minuten geleden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Clash gedetecteerd</p>
                      <p className="text-sm text-yellow-600">Revit: Pijp vs. Balk conflict op niveau 2</p>
                      <p className="text-xs text-yellow-500 mt-1">2 uur geleden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Nieuwe tekening beschikbaar</p>
                      <p className="text-sm text-blue-600">AutoCAD: Plattegrond BG revisie 3.2 goedgekeurd</p>
                      <p className="text-xs text-blue-500 mt-1">4 uur geleden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Euro className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Budget status update</p>
                      <p className="text-sm text-green-600">Exact: 85% budget gerealiseerd - binnen planning</p>
                      <p className="text-xs text-green-500 mt-1">1 dag geleden</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;