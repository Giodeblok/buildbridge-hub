import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Clock, AlertTriangle, Calendar, Box, FileText, Euro, Bell, Filter, Folder, File, Download, Eye, Upload, Plus, CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FileImportDialog from "@/components/FileImportDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Maximize2, Download as DownloadIcon, AlertCircle, Loader2 } from "lucide-react";

const MS_TOKEN_KEY = "msproject_token";
const AUTOCAD_TOKEN_KEY = "autocad_token";
const ASTA_TOKEN_KEY = "asta_token";
const REVIT_TOKEN_KEY = "revit_token";

interface ToolFile {
  id: string;
  name: string;
  originalName?: string; // For imported files, keep original filename with timestamp
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
  const [importedFiles, setImportedFiles] = useState<ToolFile[]>([]);
  const [connectedTools, setConnectedTools] = useState<string[]>([]);
  
  // State voor file preview modal met responsive design en error handling
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    file: ToolFile | null;
    fileUrl: string | null;
    fileType: string | null;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    file: null,
    fileUrl: null,
    fileType: null,
    loading: false,
    error: null
  });

  // State voor responsive design
  const [isMobile, setIsMobile] = useState(false);
  
  const msToken = localStorage.getItem(MS_TOKEN_KEY);
  const autocadToken = localStorage.getItem(AUTOCAD_TOKEN_KEY);
  const astaToken = localStorage.getItem(ASTA_TOKEN_KEY);
  const revitToken = localStorage.getItem(REVIT_TOKEN_KEY);

  // Geen mock bestanden meer - alleen echte data

  // Detecteer geïntegreerde tools
  useEffect(() => {
    const tools: IntegratedTool[] = [];
    
    // Haal projectgegevens op uit localStorage
    const savedProjects = localStorage.getItem('projects');
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    const currentProject = projects.find((p: any) => p.id === projectId);
    
    // Bepaal connectedTools op basis van het project, niet op basis van tokens
    if (currentProject && currentProject.connectedTools) {
      console.log('Project connectedTools:', currentProject.connectedTools);
      setConnectedTools(currentProject.connectedTools);
      
      // Voeg alleen tools toe die daadwerkelijk gekoppeld zijn aan dit project
      currentProject.connectedTools.forEach((toolName: string) => {
        console.log('Processing tool:', toolName);
        switch(toolName) {
          case 'AutoCAD':
            tools.push({
              name: 'AutoCAD',
              icon: FileText,
              token: autocadToken,
              projects: autocadProjects,
              files: autocadFiles
            });
            break;
          case 'MS Project':
            tools.push({
              name: 'MS Project',
              icon: Calendar,
              token: msToken,
              projects: msProjects,
              files: []
            });
            break;
          case 'Asta Powerproject':
            tools.push({
              name: 'Asta Powerproject',
              icon: Calendar,
              token: astaToken,
              projects: astaProjects,
              files: []
            });
            break;
          case 'Revit':
            tools.push({
              name: 'Revit',
              icon: FileText,
              token: revitToken,
              projects: revitProjects,
              files: []
            });
            break;
          case 'PDF':
            tools.push({
              name: 'PDF',
              icon: FileText,
              token: null,
              projects: [],
              files: []
            });
            break;
        }
      });
    }
    
    setIntegratedTools(tools);
  }, [projectId, autocadToken, msToken, astaToken, revitToken, autocadProjects, msProjects, astaProjects, revitProjects, autocadFiles]);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Memory management: Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewModal.fileUrl) {
        URL.revokeObjectURL(previewModal.fileUrl);
      }
    };
  }, [previewModal.fileUrl]);

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
      case 'pdf': return 'PDF';
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
        if (folder.name && ['autocad', 'msproject', 'asta', 'revit', 'pdf'].includes(folder.name)) {
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

  // Load imported files from database
  const loadImportedFiles = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .list(projectId, { limit: 100 });

      if (error) {
        console.error('Error loading imported files:', error);
        return;
      }

      const files: ToolFile[] = [];
      
      for (const folder of data) {
        if (folder.name && ['autocad', 'msproject', 'asta', 'revit', 'pdf'].includes(folder.name)) {
          const { data: folderFiles } = await supabase.storage
            .from('project-files')
            .list(`${projectId}/${folder.name}`, { limit: 100 });

          if (folderFiles) {
            const toolFiles = folderFiles.map(file => ({
              id: `imported-${file.name}`,
              name: file.name.replace(/^\d+_/, ''), // Remove timestamp prefix for display
              originalName: file.name, // Keep original name for download
              type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
              size: file.metadata?.size ? formatFileSize(file.metadata.size) : 'Unknown',
              lastModified: file.updated_at || new Date().toISOString(),
              status: 'active' as const,
              tool: getToolDisplayName(folder.name)
            }));
            files.push(...toolFiles);
          }
        }
      }

      console.log('Imported files loaded:', files);
      setImportedFiles(files);
    } catch (error) {
      console.error('Error loading imported files:', error);
    }
  };

  const handleFileImported = () => {
    loadImportedFiles();
  };

  // Helper function to get MIME type
  const getMimeType = (fileType: string): string => {
    const type = fileType.toLowerCase();
    switch (type) {
      case 'pdf':
        return 'application/pdf';
      case 'dwg':
      case 'dxf':
        return 'application/acad';
      case 'rvt':
      case 'rfa':
      case 'rte':
        return 'application/octet-stream';
      case 'mpp':
      case 'mpx':
        return 'application/vnd.ms-project';
      case 'pp':
      case 'ppx':
        return 'application/octet-stream';
      default:
        return 'application/octet-stream';
    }
  };

  // Function to close preview modal and clean up (Memory management)
  const closePreviewModal = () => {
    if (previewModal.fileUrl) {
      URL.revokeObjectURL(previewModal.fileUrl);
    }
    setPreviewModal({
      open: false,
      file: null,
      fileUrl: null,
      fileType: null,
      loading: false,
      error: null
    });
  };

  // Function to download file from preview modal
  const downloadFileFromPreview = () => {
    if (previewModal.fileUrl && previewModal.file) {
      try {
        const link = document.createElement('a');
        link.href = previewModal.fileUrl;
        link.download = previewModal.file.name;
        link.click();
        
        toast("Download gestart", { 
          description: `${previewModal.file.name} wordt gedownload.` 
        });
      } catch (error) {
        toast("Download mislukt", { 
          description: "Er is een fout opgetreden bij het downloaden."
        });
      }
    }
  };

  // Function to open file in new tab
  const openFileInNewTab = () => {
    if (previewModal.fileUrl) {
      try {
        window.open(previewModal.fileUrl, '_blank');
        toast("Bestand geopend", { 
          description: `${previewModal.file?.name} is geopend in een nieuwe tab.` 
        });
      } catch (error) {
        toast("Openen mislukt", { 
          description: "Er is een fout opgetreden bij het openen in nieuwe tab."
        });
      }
    }
  };

  const handleOpenFile = async (file: ToolFile) => {
    try {
      // Check if this is an imported file
      if (file.id.startsWith('imported-')) {
        // For imported files, try to open them using the appropriate method
        // Find the tool ID by matching the tool name
        let toolId = null;
        if (file.tool === 'AutoCAD') {
          toolId = 'autocad';
        } else if (file.tool === 'MS Project') {
          toolId = 'msproject';
        } else if (file.tool === 'Asta Powerproject') {
          toolId = 'asta';
        } else if (file.tool === 'Revit') {
          toolId = 'revit';
        } else if (file.tool === 'PDF') {
          toolId = 'pdf';
        }
        
        if (toolId && connectedTools.includes(file.tool)) {
          // Show loading state
          setPreviewModal(prev => ({
            ...prev,
            open: true,
            file: file,
            loading: true,
            error: null
          }));

          toast("Bestand wordt geladen...", { 
            description: `${file.name} wordt voorbereid voor weergave.` 
          });
          
          // Get the file from Supabase Storage
          const fileName = file.originalName || file.name; // Use original name if available
          const filePath = `${projectId}/${toolId}/${fileName}`;
          console.log('Downloading file from path:', filePath); // Debug log
          const { data, error } = await supabase.storage
            .from('project-files')
            .download(filePath);
          
          if (error) {
            console.error('Supabase storage error:', error);
            if (error.message) {
              throw new Error(`Storage error: ${error.message}`);
            } else {
              throw new Error(`Bestand niet gevonden: ${fileName}`);
            }
          }
          
          if (!data) {
            throw new Error('Geen bestandsdata ontvangen');
          }
          
          // Create a blob URL and open the file
          const blob = new Blob([data], { type: getMimeType(file.type) });
          const url = URL.createObjectURL(blob);
          
          // Determine file type and set modal state
          let fileType = 'other';
          if (file.type.toLowerCase() === 'pdf') {
            fileType = 'pdf';
          } else if (file.type.toLowerCase() === 'dwg' || file.type.toLowerCase() === 'dxf') {
            fileType = 'cad';
          }
          
          setPreviewModal(prev => ({
            ...prev,
            fileUrl: url,
            fileType: fileType,
            loading: false,
            error: null
          }));

          toast("Bestand geladen", { 
            description: `${file.name} is klaar voor weergave.` 
          });
          
        } else {
          toast("Tool niet gevonden", { 
            description: `${file.tool} is niet meer gekoppeld aan dit project.`
          });
        }
      } else {
        // Use existing preview/download logic for API files
        handlePreviewFile(file);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      setPreviewModal(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast("Fout bij openen bestand", { 
        description: `Er is een fout opgetreden: ${errorMessage}`
      });
    }
  };

  useEffect(() => {
    loadProjectData();
    loadFilesFromStorage();
    loadImportedFiles();
  }, [projectId]);

  // Update allFiles wanneer bestanden veranderen
  useEffect(() => {
    const allFilesCombined = [
      ...autocadFiles,
      ...astaFiles,
      ...importedFiles
    ];
    console.log('All files combined:', allFilesCombined);
    setAllFiles(allFilesCombined);
  }, [autocadFiles, astaFiles, importedFiles]);

  // Combineer projecten
  const allProjects = [
    ...((msToken && msProjects.length > 0) ? msProjects : []),
    ...((autocadToken && autocadProjects.length > 0) ? autocadProjects : []),
    ...((astaToken && astaProjects.length > 0) ? astaProjects : []),
    ...((revitToken && revitProjects.length > 0) ? revitProjects : [])
  ];

  // Echte data berekening
  const realData = {
    activeProjects: allProjects.length,
    totalBudget: 0, // Zou uit API komen
    completionRate: 0, // Zou uit API komen
    pendingTasks: 0, // Zou uit API komen
    teamMembers: 0, // Zou uit API komen
    overdueItems: 0 // Zou uit API komen
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
                  <div className="text-2xl font-bold">{realData.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">+1 deze maand</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Totaal Budget</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{(realData.totalBudget / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">75% uitgegeven</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voortgang</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realData.completionRate}%</div>
                  <Progress value={realData.completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Openstaande Taken</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realData.pendingTasks}</div>
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
                        <span className="text-sm">{realData.teamMembers} actieve leden</span>
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
              {integratedTools
                .filter(tool => connectedTools.includes(tool.name))
                .map((tool) => (
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
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5" />
                    Alle Bestanden ({allFiles.length})
                  </div>
                  {projectId && (
                    <FileImportDialog 
                      projectId={projectId}
                      connectedTools={connectedTools}
                      onFileImported={handleFileImported}
                    />
                  )}
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
                            <button 
                              className="font-medium text-left hover:text-primary transition-colors"
                              onClick={() => handleOpenFile(file)}
                              title="Klik om bestand te openen"
                            >
                              {file.name}
                            </button>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{file.tool}</span>
                              <span>{file.type}</span>
                              {file.size && <span>{file.size}</span>}
                              <span>{new Date(file.lastModified).toLocaleDateString('nl-NL')}</span>
                              {file.id.startsWith('imported-') && (
                                <Badge variant="outline" className="text-xs">Geïmporteerd</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={file.status === 'active' ? 'default' : 'secondary'}>
                            {file.status === 'active' ? 'Actief' : 'Archief'}
                          </Badge>
                          {!file.id.startsWith('imported-') && (
                            <>
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
                            </>
                          )}
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
                  Openstaande Taken ({realData.pendingTasks})
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

        {/* File Preview Modal - Responsive Design */}
        <Dialog open={previewModal.open} onOpenChange={closePreviewModal}>
          <DialogContent className={`${isMobile ? 'w-[95vw] h-[90vh]' : 'max-w-4xl max-h-[90vh]'} overflow-hidden`}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <File className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{previewModal.file?.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {previewModal.fileType === 'pdf' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openFileInNewTab}
                      title="Open in nieuwe tab"
                      className="hidden sm:flex"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadFileFromPreview}
                    title="Download bestand"
                    className="hidden sm:flex"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closePreviewModal}
                    title="Sluiten"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              {/* Loading State */}
              {previewModal.loading && (
                <div className="w-full h-[70vh] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Bestand laden...</h3>
                    <p className="text-gray-600">{previewModal.file?.name}</p>
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {previewModal.error && (
                <div className="w-full h-[70vh] border rounded-lg overflow-hidden bg-red-50 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold mb-2 text-red-700">Fout bij laden bestand</h3>
                    <p className="text-red-600 mb-4">{previewModal.error}</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={closePreviewModal} variant="outline">
                        Sluiten
                      </Button>
                      <Button onClick={() => handleOpenFile(previewModal.file!)}>
                        Opnieuw proberen
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* PDF Viewer */}
              {previewModal.fileType === 'pdf' && previewModal.fileUrl && !previewModal.loading && !previewModal.error && (
                <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
                  <iframe
                    src={`${previewModal.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full"
                    title={previewModal.file?.name}
                    onError={() => {
                      setPreviewModal(prev => ({
                        ...prev,
                        error: 'PDF kan niet worden geladen'
                      }));
                    }}
                  />
                </div>
              )}
              
              {/* CAD Viewer */}
              {previewModal.fileType === 'cad' && !previewModal.loading && !previewModal.error && (
                <div className="w-full h-[70vh] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">CAD Bestand Preview</h3>
                    <p className="text-gray-600 mb-4">
                      {previewModal.file?.name} ({previewModal.file?.type.toUpperCase()})
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      CAD bestanden kunnen niet direct in de browser worden weergegeven.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={downloadFileFromPreview} className="w-full sm:w-auto">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download voor AutoCAD
                      </Button>
                      <Button variant="outline" onClick={openFileInNewTab} className="w-full sm:w-auto">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Open in nieuwe tab
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Other Files Viewer */}
              {previewModal.fileType === 'other' && !previewModal.loading && !previewModal.error && (
                <div className="w-full h-[70vh] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Bestand Preview</h3>
                    <p className="text-gray-600 mb-4">
                      {previewModal.file?.name} ({previewModal.file?.type.toUpperCase()})
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Dit bestandstype kan niet direct in de browser worden weergegeven.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={downloadFileFromPreview} className="w-full sm:w-auto">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download Bestand
                      </Button>
                      <Button variant="outline" onClick={openFileInNewTab} className="w-full sm:w-auto">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Open in nieuwe tab
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Action Buttons */}
            {isMobile && previewModal.file && !previewModal.loading && !previewModal.error && (
              <div className="flex gap-2 mt-4">
                {previewModal.fileType === 'pdf' && (
                  <Button onClick={openFileInNewTab} variant="outline" className="flex-1">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Nieuwe tab
                  </Button>
                )}
                <Button onClick={downloadFileFromPreview} className="flex-1">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

export default Dashboard;
