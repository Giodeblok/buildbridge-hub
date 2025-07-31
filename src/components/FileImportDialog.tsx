import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FileImportDialogProps {
  projectId: string;
  connectedTools: string[];
  onFileImported: () => void;
}

const TOOL_MAPPINGS = {
  'AutoCAD': 'autocad',
  'MS Project': 'msproject', 
  'Asta Powerproject': 'asta',
  'Revit': 'revit'
};

const FileImportDialog = ({ projectId, connectedTools, onFileImported }: FileImportDialogProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showToolWarning, setShowToolWarning] = useState(false);
  const [selectedToolForWarning, setSelectedToolForWarning] = useState<string>("");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleToolSelect = (toolName: string) => {
    const toolId = TOOL_MAPPINGS[toolName as keyof typeof TOOL_MAPPINGS];
    
    // Check if tool is connected to project
    if (!connectedTools.includes(toolId)) {
      setSelectedToolForWarning(toolName);
      setShowToolWarning(true);
      return;
    }
    
    setSelectedTool(toolName);
  };

  const handleImport = async () => {
    if (!file || !selectedTool || !projectId) return;

    setUploading(true);
    
    try {
      const toolId = TOOL_MAPPINGS[selectedTool as keyof typeof TOOL_MAPPINGS];
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${projectId}/${toolId}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // File successfully uploaded to storage
      // Note: We're using storage for now, metadata could be tracked separately if needed

      toast({
        title: "Bestand geïmporteerd",
        description: `${file.name} is succesvol geïmporteerd.`,
      });

      onFileImported();
      setShowDialog(false);
      setFile(null);
      setSelectedTool("");
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import mislukt",
        description: "Er is een fout opgetreden bij het importeren van het bestand.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGoToIntegrations = () => {
    setShowToolWarning(false);
    navigate('/integraties');
  };

  const handleGoToProjects = () => {
    setShowToolWarning(false);
    navigate('/dashboard');
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bestand Importeren
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nieuw Bestand Importeren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tool-select">Selecteer Tool</Label>
              <Select value={selectedTool} onValueChange={handleToolSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies een tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AutoCAD">AutoCAD</SelectItem>
                  <SelectItem value="MS Project">MS Project</SelectItem>
                  <SelectItem value="Asta Powerproject">Asta Powerproject</SelectItem>
                  <SelectItem value="Revit">Revit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file-input">Selecteer Bestand</Label>
              <Input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                disabled={!selectedTool}
              />
            </div>

            {file && (
              <div className="text-sm text-muted-foreground">
                Geselecteerd bestand: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuleren
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || !selectedTool || uploading}
            >
              {uploading ? "Importeren..." : "Importeren"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showToolWarning} onOpenChange={setShowToolWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Tool Niet Gekoppeld
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedToolForWarning} is nog niet gekoppeld aan dit project. 
              U moet eerst de tool koppelen voordat u bestanden kunt importeren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToIntegrations}>
              Naar Integraties
            </AlertDialogAction>
            <AlertDialogAction onClick={handleGoToProjects}>
              Naar Projecten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileImportDialog;