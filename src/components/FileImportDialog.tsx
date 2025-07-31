import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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

// Bestandsextensies per tool
const SUPPORTED_EXTENSIONS = {
  'AutoCAD': ['.dwg', '.dxf'],
  'MS Project': ['.mpp', '.mpx'],
  'Asta Powerproject': ['.pp', '.ppx'],
  'Revit': ['.rvt', '.rfa', '.rte']
};

const FileImportDialog = ({ projectId, connectedTools, onFileImported }: FileImportDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [showToolWarning, setShowToolWarning] = useState(false);
  const [showFileTypeError, setShowFileTypeError] = useState(false);
  const [selectedToolForWarning, setSelectedToolForWarning] = useState<string>("");
  const [errorFile, setErrorFile] = useState<string>("");
  const [errorTool, setErrorTool] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Functie om storage bucket te controleren en aan te maken
  const ensureStorageBucket = async () => {
    try {
      // Probeer direct een test upload te doen om te zien of de bucket bestaat
      // Dit is betrouwbaarder dan listBuckets() omdat dat alleen voor admins werkt
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const { error: testError } = await supabase.storage
        .from('project-files')
        .upload(`test/${testFileName}`, testBlob);

      if (testError) {
        console.error('Bucket test failed:', testError);
        
        // Als de bucket niet bestaat, probeer deze aan te maken
        if (testError.message.includes('bucket') || testError.message.includes('not found')) {
          console.log('Attempting to create project-files bucket...');
          
          // Probeer de bucket aan te maken via een eenvoudige upload
          // Dit werkt alleen als de bucket bestaat of automatisch wordt aangemaakt
          return false;
        }
        
        return false;
      }

      // Verwijder het test bestand
      await supabase.storage
        .from('project-files')
        .remove([`test/${testFileName}`]);

      console.log('Bucket exists and is accessible');
      return true;
    } catch (error) {
      console.error('Error ensuring storage bucket:', error);
      return false;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    console.log('Selected file:', selectedFile.name);
    console.log('Connected tools:', connectedTools);

    // Bepaal tool op basis van bestandsextensie
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    let detectedTool = '';

    for (const [tool, extensions] of Object.entries(SUPPORTED_EXTENSIONS)) {
      if (extensions.includes(fileExtension)) {
        detectedTool = tool;
        break;
      }
    }

    console.log('Detected tool:', detectedTool);
    console.log('File extension:', fileExtension);

    // Als geen tool gedetecteerd, toon foutmelding
    if (!detectedTool) {
      setErrorFile(selectedFile.name);
      setErrorTool('onbekend');
      setShowFileTypeError(true);
      return;
    }

    const toolId = TOOL_MAPPINGS[detectedTool as keyof typeof TOOL_MAPPINGS];
    console.log('Tool ID:', toolId);
    
    // Check of tool gekoppeld is aan project
    if (!connectedTools.includes(toolId)) {
      console.log('Tool not connected:', toolId);
      
      // Demo modus: toon waarschuwing maar ga door met import
      if (connectedTools.length === 0) {
        console.log('Demo mode: proceeding with import without connected tools');
        await importFile(selectedFile, detectedTool);
        return;
      }
      
      setSelectedToolForWarning(detectedTool);
      setShowToolWarning(true);
      return;
    }

    // Start import proces
    await importFile(selectedFile, detectedTool);
  };

  const importFile = async (file: File, toolName: string) => {
    if (!file || !toolName || !projectId) {
      console.error('Missing required data:', { file: !!file, toolName, projectId });
      return;
    }

    setUploading(true);
    
    try {
      const toolId = TOOL_MAPPINGS[toolName as keyof typeof TOOL_MAPPINGS];
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${projectId}/${toolId}/${fileName}`;
      
      console.log('Uploading file:', { fileName, filePath, fileSize: file.size });
      
      // Upload file naar Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully');

      toast({
        title: "Bestand geïmporteerd",
        description: `${file.name} is succesvol geïmporteerd voor ${toolName}.`,
      });

      onFileImported();
      
    } catch (error) {
      console.error('Import error:', error);
      
      // Specifieke foutmeldingen
      let errorMessage = "Er is een fout opgetreden bij het importeren van het bestand.";
      
      if (error instanceof Error) {
        if (error.message.includes('bucket')) {
          errorMessage = "Storage bucket niet gevonden. Controleer of de bucket 'project-files' bestaat in Supabase.";
        } else if (error.message.includes('permission')) {
          errorMessage = "Geen toestemming om bestanden te uploaden. Controleer de storage policies.";
        } else if (error.message.includes('network')) {
          errorMessage = "Netwerkfout. Controleer je internetverbinding.";
        } else {
          errorMessage = `Fout: ${error.message}`;
        }
      }
      
      toast({
        title: "Import mislukt",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleFileTypeErrorClose = () => {
    setShowFileTypeError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".dwg,.dxf,.mpp,.mpx,.pp,.ppx,.rvt,.rfa,.rte"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Importeren..." : "Bestand Importeren"}
        </Button>
      </div>

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

      <AlertDialog open={showFileTypeError} onOpenChange={setShowFileTypeError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Niet-ondersteund Bestandstype
            </AlertDialogTitle>
            <AlertDialogDescription>
              Het bestand "{errorFile}" wordt niet ondersteund. 
              Ondersteunde bestandstypen zijn: .dwg, .dxf, .mpp, .mpx, .pp, .ppx, .rvt, .rfa, .rte
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleFileTypeErrorClose}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileImportDialog;