import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Settings, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  connectedTools: string[];
}

// Tool mapping voor weergave
const toolDisplayNames: { [key: string]: string } = {
  msproject: "MS Project",
  asta: "Asta Powerproject",
  revit: "Autodesk Revit",
  autocad: "AutoCAD",
  bluebeam: "Bluebeam Revu",
  afas: "AFAS",
  excel: "Excel",
  exact: "Exact",
  whatsapp: "WhatsApp",
  solibri: "Solibri"
};

// Token keys die overeenkomen met Integrations pagina
const TOKEN_KEYS: { [key: string]: string } = {
  msproject: "msproject_token",
  autocad: "autocad_token",
  asta: "asta_token",
  revit: "revit_token",
  solibri: "solibri_token",
  excel: "excel_token",
  whatsapp: "whatsapp_token"
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    if (saved) return JSON.parse(saved);
    return [];
  });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    selectedTools: [] as string[]
  });
  const [userTools, setUserTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      toast.error("Projectnaam is verplicht");
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      createdAt: new Date().toISOString().split('T')[0],
      connectedTools: newProject.selectedTools
    };

    setProjects(prev => {
      const updated = [...prev, project];
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
    setNewProject({ name: "", description: "", selectedTools: [] });
    setIsAddDialogOpen(false);
    toast.success("Project succesvol toegevoegd");
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
    toast.success("Project verwijderd");
  };

  const handleToolToggle = (tool: string) => {
    setNewProject(prev => ({
      ...prev,
      selectedTools: prev.selectedTools.includes(tool)
        ? prev.selectedTools.filter(t => t !== tool)
        : [...prev.selectedTools, tool]
    }));
  };

  const openProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (project: Project) => {
    // Vul het nieuwe project formulier met de bestaande projectgegevens
    setNewProject({
      name: project.name,
      description: project.description,
      selectedTools: project.connectedTools
    });
    setEditProject(project);
    setIsAddDialogOpen(true);
  };

  const handleEditProjectSave = () => {
    if (!editProject) return;
    
    // Update het project met de nieuwe gegevens
    const updatedProject = {
      ...editProject,
      name: newProject.name,
      description: newProject.description,
      connectedTools: newProject.selectedTools
    };
    
    setProjects(prev => {
      const updated = prev.map(p => p.id === editProject.id ? updatedProject : p);
      localStorage.setItem('projects', JSON.stringify(updated));
      return updated;
    });
    
    // Reset het formulier
    setNewProject({
      name: '',
      description: '',
      selectedTools: []
    });
    setEditProject(null);
    setIsAddDialogOpen(false);
  };

  // Laad gekoppelde tools van gebruiker
  useEffect(() => {
    const loadUserTools = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Haal tools op uit Supabase database
          const { data: toolsData } = await supabase
            .from('user_tools')
            .select('tool_id')
            .eq('user_id', user.id);
          
          if (toolsData) {
            // Filter alleen tools die daadwerkelijk gekoppeld zijn (hebben tokens)
            const connectedTools = toolsData
              .map(tool => tool.tool_id)
              .filter(toolId => {
                // Check of er een token bestaat voor deze tool
                const tokenKey = TOKEN_KEYS[toolId] || `${toolId}_token`;
                return !!localStorage.getItem(tokenKey);
              });
            
            setUserTools(connectedTools);
          }
        } else {
          // Fallback naar localStorage voor niet-ingelogde gebruikers
          const saved = localStorage.getItem('selectedTools');
          if (saved) {
            const selectedTools = JSON.parse(saved);
            // Filter alleen gekoppelde tools
            const connectedTools = selectedTools.filter((toolId: string) => {
              const tokenKey = TOKEN_KEYS[toolId] || `${toolId}_token`;
              return !!localStorage.getItem(tokenKey);
            });
            setUserTools(connectedTools);
          }
        }
      } catch (error) {
        console.error('Error loading user tools:', error);
        // Fallback naar localStorage
        const saved = localStorage.getItem('selectedTools');
        if (saved) {
          const selectedTools = JSON.parse(saved);
          // Filter alleen gekoppelde tools
          const connectedTools = selectedTools.filter((toolId: string) => {
            const tokenKey = TOKEN_KEYS[toolId] || `${toolId}_token`;
            return !!localStorage.getItem(tokenKey);
          });
          setUserTools(connectedTools);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserTools();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      const filtered = parsed.filter((project: Project) =>
        !project.name.includes('Nieuwbouw Kantoorcomplex Amsterdam') &&
        !project.name.includes('Renovatie Ziekenhuis Rotterdam')
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem('projects', JSON.stringify(filtered));
        setProjects(filtered);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-construction-primary mb-4">
              Mijn Projecten
            </h1>
            <p className="text-muted-foreground text-lg">
              Beheer al je bouwprojecten en gekoppelde tools op één plek
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-construction-primary hover:bg-construction-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editProject ? 'Project Bewerken' : 'Nieuw Project Toevoegen'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Projectnaam *</Label>
                  <Input
                    id="projectName"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijv. Nieuwbouw Kantoorcomplex"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Beschrijving</Label>
                  <Input
                    id="projectDescription"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Korte beschrijving van het project"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Koppel Tools (Alleen geïntegreerde tools)</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecteer welke tools je wilt koppelen aan dit project
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {loading ? (
                      <div className="col-span-2 text-center py-4 text-muted-foreground">
                        Tools laden...
                      </div>
                    ) : userTools.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-muted-foreground">
                        Geen tools gekoppeld. Ga naar <a href="/integraties" className="text-construction-primary hover:underline">Integraties</a> om tools toe te voegen.
                      </div>
                    ) : (
                      userTools.map((toolId) => {
                        const toolName = toolDisplayNames[toolId] || toolId;
                        return (
                          <div
                            key={toolId}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              newProject.selectedTools.includes(toolName)
                                ? 'border-construction-primary bg-construction-primary/5'
                                : 'border-border hover:border-construction-primary/50'
                            }`}
                            onClick={() => handleToolToggle(toolName)}
                          >
                            <div className="font-medium">{toolName}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditProject(null);
                      setNewProject({
                        name: '',
                        description: '',
                        selectedTools: []
                      });
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button 
                    onClick={editProject ? handleEditProjectSave : handleAddProject}
                    className="bg-construction-primary hover:bg-construction-primary/90"
                  >
                    {editProject ? 'Project Bijwerken' : 'Project Toevoegen'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Geen projecten gevonden</h3>
              <p className="text-muted-foreground mb-4">
                Begin met het toevoegen van je eerste bouwproject
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-construction-primary hover:bg-construction-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Eerste Project Toevoegen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2 text-lg">
                      {project.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {project.description || "Geen beschrijving"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Gekoppelde tools ({project.connectedTools.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.connectedTools.length > 0 ? (
                          project.connectedTools.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Geen tools gekoppeld
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Aangemaakt: {new Date(project.createdAt).toLocaleDateString('nl-NL')}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openProject(project.id)}
                        className="flex-1 bg-construction-primary hover:bg-construction-primary/90"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Openen
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}