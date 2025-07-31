import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Clock, AlertTriangle, Calendar, Box, FileText, Euro, Bell, Filter, Folder, File, Download, Eye, Upload, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MS_TOKEN_KEY = "msproject_token";
const AUTOCAD_TOKEN_KEY = "autocad_token";
const ASTA_TOKEN_KEY = "asta_token";
const REVIT_TOKEN_KEY = "revit_token";

interface ToolFile {
  id: string;
  name: string;
  type: string;
  size?: string;
  lastModified: string;
  status: 'active' | 'archived' | 'draft';
  tool: string;
}

interface IntegratedTool {
  name: string;
  icon: any;
  token: string | null;
  projects: any[];
  files: ToolFile[];
}

const Dashboard = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [msProjects, setMsProjects] = useState<any[]>([]);
  const [autocadProjects, setAutocadProjects] = useState<any[]>([]);
  const [astaProjects, setAstaProjects] = useState<any[]>([]);
  const [revitProjects, setRevitProjects] = useState<any[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
  const [integratedTools, setIntegratedTools] = useState<IntegratedTool[]>([]);
  const [allFiles, setAllFiles] = useState<ToolFile[]>([]);
  const [autocadFiles, setAutocadFiles] = useState<ToolFile[]>([]);
  const [astaFiles, setAstaFiles] = useState<ToolFile[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  
  const msToken = localStorage.getItem(MS_TOKEN_KEY);
  const autocadToken = localStorage.getItem(AUTOCAD_TOKEN_KEY);
  const astaToken = localStorage.getItem(ASTA_TOKEN_KEY);
  const revitToken = localStorage.getItem(REVIT_TOKEN_KEY);

  // Mock bestanden per tool (fallback)
  const mockFiles: { [key: string]: ToolFile[] } = {
    autocad: [
      {
        id: 'ac-001',
        name: 'Plattegrond_BG.dwg',
        type: 'DWG',
        size: '2.4 MB',
        lastModified: '2024-02-14T10:30:00Z',
        status: 'active',
        tool: 'AutoCAD'
      },
      {
        id: 'ac-002',
        name: 'Sectie_A-A.dwg',
        type: 'DWG',
        size: '1.8 MB',
        lastModified: '2024-02-13T15:45:00Z',
        status: 'active',
        tool: 'AutoCAD'
      }
    ],
    msproject: [
      {
        id: 'ms-001',
        name: 'Wooncomplex_Planning.mpp',
        type: 'MPP',
        size: '1.2 MB',
        lastModified: '2024-02-14T08:15:00Z',
        status: 'active',
        tool: 'MS Project'
      },
      {
        id: 'ms-002',
        name: 'Resource_Planning.mpp',
        type: 'MPP',
        size: '0.8 MB',
        lastModified: '2024-02-13T14:30:00Z',
        status: 'active',
        tool: 'MS Project'
      }
    ],
    asta: [
      {
        id: 'asta-001',
        name: 'Wooncomplex_Planning.ast',
        type: 'AST',
        size: '3.2 MB',
        lastModified: '2024-02-14T09:15:00Z',
        status: 'active',
        tool: 'Asta Powerproject'
      },
      {
        id: 'asta-002',
        name: 'Resource_Planning.ast',
        type: 'AST',
        size: '1.8 MB',
        lastModified: '2024-02-13T16:30:00Z',
        status: 'active',
        tool: 'Asta Powerproject'
      }
    ],
    revit: [
      {
        id: 'rv-001',
        name: 'BIM_Model.rvt',
        type: 'RVT',
        size: '45.2 MB',
        lastModified: '2024-02-14T11:20:00Z',
        status: 'active',
        tool: 'Revit'
      },
      {
        id: 'rv-002',
        name: 'Families_Collectie.rfa',
        type: 'RFA',
        size: '12.8 MB',
        lastModified: '2024-02-13T16:45:00Z',
        status: 'active',
        tool: 'Revit'
      }
    ]
  };

  // Detecteer geïntegreerde tools
  useEffect(() => {
    const tools: IntegratedTool[] = [];
    
    if (autocadToken) {
      tools.push({
        name: 'AutoCAD',
        icon: FileText,
        token: autocadToken,
        projects: autocadProjects,
        files: autocadFiles.length > 0 ? autocadFiles : mockFiles.autocad || []
      });
    }
    
    if (msToken) {
      tools.push({
        name: 'MS Project',
        icon: Calendar,
        token: msToken,
        projects: msProjects,
        files: mockFiles.msproject
      });
    }
    
    if (astaToken) {
      tools.push({
        name: 'Asta Powerproject',
        icon: Calendar,
        token: astaToken,
        projects: astaProjects,
        files: astaFiles.length > 0 ? astaFiles : mockFiles.asta || []
      });
    }
    
    if (revitToken) {
      tools.push({
        name: 'Revit',
        icon: Box,
        token: revitToken,
        projects: revitProjects,
        files: mockFiles.revit
      });
    }
    
    setIntegratedTools(tools);
    setAllFiles(tools.flatMap(tool => tool.files));
  }, [autocadToken, msToken, astaToken, revitToken, autocadProjects, msProjects, astaProjects, revitProjects, autocadFiles, astaFiles]);

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
        // Haal projecten op
        const projectsRes = await fetch("http://localhost:4000/autocad/projects", {
          headers: { Authorization: `Bearer ${autocadToken}` }
        });
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setAutocadProjects(data.projects || []);
        }

        // Haal bestanden op
        const filesRes = await fetch("http://localhost:4000/autocad/files", {
          headers: { Authorization: `Bearer ${autocadToken}` }
        });
        if (filesRes.ok) {
          const data = await filesRes.json();
          const filesWithTool = data.files.map((file: any) => ({
            ...file,
            tool: 'AutoCAD'
          }));
          setAutocadFiles(filesWithTool);
        }
      } catch (error) {
        console.error('Error loading AutoCAD data:', error);
      }
    }
    
    if (astaToken) {
      try {
        // Haal projecten op
        const projectsRes = await fetch("http://localhost:4000/asta/projects", {
          headers: { Authorization: `Bearer ${astaToken}` }
        });
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setAstaProjects(data.projects || []);
        }

        // Haal bestanden op
        const filesRes = await fetch("http://localhost:4000/asta/files", {
          headers: { Authorization: `Bearer ${astaToken}` }
        });
        if (filesRes.ok) {
          const data = await filesRes.json();
          const filesWithTool = data.files.map((file: any) => ({
            ...file,
            tool: 'Asta Powerproject'
          }));
          setAstaFiles(filesWithTool);
        }
      } catch (error) {
        console.error('Error loading Asta Powerproject data:', error);
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

  // Handler functies voor bestanden
  const handleDownloadFile = async (file: ToolFile) => {
    try {
      let token, endpoint;
      
      if (file.tool === 'AutoCAD') {
        token = localStorage.getItem(AUTOCAD_TOKEN_KEY);
        endpoint = 'autocad';
      } else if (file.tool === 'Asta Powerproject') {
        token = localStorage.getItem(ASTA_TOKEN_KEY);
        endpoint = 'asta';
      } else {
        alert('Tool niet ondersteund voor download');
        return;
      }

      if (!token) {
        alert(`Geen ${file.tool} token gevonden. Log opnieuw in.`);
        return;
      }

      const response = await fetch(`http://localhost:4000/${endpoint}/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        if (endpoint === 'autocad') {
          // AutoCAD: direct download via blob
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Asta: redirect naar download URL
          const data = await response.json();
          window.open(data.downloadUrl, '_blank');
        }
      } else {
        alert('Fout bij downloaden van bestand');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Fout bij downloaden van bestand');
    }
  };

  const handlePreviewFile = async (file: ToolFile) => {
    try {
      let token, endpoint;
      
      if (file.tool === 'AutoCAD') {
        token = localStorage.getItem(AUTOCAD_TOKEN_KEY);
        endpoint = 'autocad';
      } else if (file.tool === 'Asta Powerproject') {
        token = localStorage.getItem(ASTA_TOKEN_KEY);
        endpoint = 'asta';
      } else {
        alert('Tool niet ondersteund voor preview');
        return;
      }

      if (!token) {
        alert(`Geen ${file.tool} token gevonden. Log opnieuw in.`);
        return;
      }

      const response = await fetch(`http://localhost:4000/${endpoint}/files/${file.id}/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Open preview in nieuw venster
        window.open(data.previewUrl, '_blank');
      } else {
        alert('Fout bij ophalen van preview');
      }
    } catch (error) {
      console.error('Error getting preview:', error);
      alert('Fout bij ophalen van preview');
    }
  };

  // Upload functionaliteit
  const handleFileUpload = async (toolId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId) return;

    setUploading(prev => ({ ...prev, [toolId]: true }));

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `${projectId}/${toolId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('project-files')
        .upload(path, file, { upsert: true });

      if (error) {
        toast.error(`Upload mislukt: ${error.message}`);
      } else {
        toast.success(`Bestand ${file.name} succesvol geüpload`);
        
        // Voeg bestand toe aan lokale state
        const newFile: ToolFile = {
          id: Date.now().toString(),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          size: formatFileSize(file.size),
          lastModified: new Date().toISOString(),
          status: 'active',
          tool: getToolDisplayName(toolId)
        };

        // Update de juiste tool files
        switch (toolId) {
          case 'autocad':
            setAutocadFiles(prev => [...prev, newFile]);
            break;
          case 'msproject':
            // Update MS Project files
            break;
          case 'asta':
            setAstaFiles(prev => [...prev, newFile]);
            break;
          case 'revit':
            // Update Revit files
            break;
        }
      }
    } catch (error) {
      toast.error('Upload mislukt');
      console.error('Upload error:', error);
    } finally {
      setUploading(prev => ({ ...prev, [toolId]: false }));
      // Reset input
      event.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getToolDisplayName = (toolId: string): string => {
    switch (toolId) {
      case 'autocad': return 'AutoCAD';
      case 'msproject': return 'MS Project';
      case 'asta': return 'Asta Powerproject';
      case 'revit': return 'Revit';
      default: return toolId;
    }
  };

  // Laad bestanden uit Supabase Storage
  const loadFilesFromStorage = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .list(projectId, { limit: 100 });

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      // Groepeer bestanden per tool
      const toolFiles: { [key: string]: ToolFile[] } = {};
      
      for (const folder of data) {
        if (folder.name && ['autocad', 'msproject', 'asta', 'revit'].includes(folder.name)) {
          const { data: files } = await supabase.storage
            .from('project-files')
            .list(`${projectId}/${folder.name}`, { limit: 100 });

          if (files) {
            toolFiles[folder.name] = files.map(file => ({
              id: file.id || Date.now().toString(),
              name: file.name,
              type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
              size: file.metadata?.size ? formatFileSize(file.metadata.size) : 'Unknown',
              lastModified: file.updated_at || new Date().toISOString(),
              status: 'active' as const,
              tool: getToolDisplayName(folder.name)
            }));
          }
        }
      }

      // Update state
      setAutocadFiles(toolFiles.autocad || []);
      // Update andere tool files hier...
    } catch (error) {
      console.error('Error loading files from storage:', error);
    }
  };

  useEffect(() => {
    loadProjectData();
    loadFilesFromStorage();
  }, [projectId]);

  // Combineer projecten
  const allProjects = [
    ...((msToken && msProjects.length > 0) ? msProjects : []),
    ...((autocadToken && autocadProjects.length > 0) ? autocadProjects : []),
    ...((astaToken && astaProjects.length > 0) ? astaProjects : []),
    ...((revitToken && revitProjects.length > 0) ? revitProjects : [])
  ];

  // Mock data for integrated tools - in real app this would come from localStorage or API
  const mockData = {
    activeProjects: 3,
    totalBudget: 2400000,
    completionRate: 67,
    pendingTasks: 12,
    teamMembers: 15,
    overdueItems: 3
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-construction-primary mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Realtime overzicht van {projectId ? `Project ${projectId}` : 'Wooncomplex Amstelveen'}
          </p>
        </div>

        <Tabs defaultValue="overzicht" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
            <TabsTrigger value="bestanden">Bestanden</TabsTrigger>
            <TabsTrigger value="projecten">Projecten</TabsTrigger>
            <TabsTrigger value="taken">Openstaande Taken</TabsTrigger>
          </TabsList>

          <TabsContent value="overzicht" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Actieve Projecten</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">+1 deze maand</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Budget</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{(mockData.totalBudget / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">75% uitgegeven</p>
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
                  <p className="text-xs text-red-600">3 kritiek</p>
                </CardContent>
              </Card>
            </div>

            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overzicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Planning Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fundering</span>
                        <Badge variant="secondary">Voltooid</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ruwbouw</span>
                        <Badge variant="secondary">In uitvoering</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Afbouw</span>
                        <Badge variant="outline">Gepland</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Teamleden</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{mockData.teamMembers} actieve leden</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">3 meetings deze week</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Kritieke Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Kwaliteitscore</span>
                        <span className="font-medium">8.5/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Deadline adherence</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Risico niveau</span>
                        <Badge variant="secondary">Laag</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tool Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integratedTools.map((tool) => (
                <Card key={tool.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tool.icon className="h-5 w-5" />
                      {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bestanden</span>
                        <span className="font-semibold">{tool.files.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Projecten</span>
                        <span className="font-semibold">{tool.projects.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bestanden" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Alle Bestanden ({allFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Geen bestanden gevonden</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded">
                            <File className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{file.tool}</span>
                              <span>{file.type}</span>
                              {file.size && <span>{file.size}</span>}
                              <span>{new Date(file.lastModified).toLocaleDateString('nl-NL')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                            {file.status === 'active' ? 'Actief' : 'Archief'}
                          </Badge>
                          <button 
                            className="p-2 hover:bg-muted rounded"
                            onClick={() => handlePreviewFile(file)}
                            title="Bekijk preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-2 hover:bg-muted rounded"
                            onClick={() => handleDownloadFile(file)}
                            title="Download bestand"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projecten" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Project details sectie</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taken" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Openstaande Taken ({mockData.pendingTasks})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Taak {i}: Review van tekeningen</p>
                        <p className="text-sm text-muted-foreground">Deadline: {new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}</p>
                      </div>
                      <Badge variant={i <= 3 ? "destructive" : "secondary"}>
                        {i <= 3 ? "Kritiek" : "Normaal"}
                      </Badge>
                    </div>
                  ))}
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
