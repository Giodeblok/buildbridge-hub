import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { 
  FileSpreadsheet, MessageSquare, Calendar, Database, 
  Layers, Box, CheckSquare, PenTool, FileText, Calculator 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const tools = [
  { id: "excel", name: "Excel", description: "Spreadsheets en calculaties", icon: FileSpreadsheet },
  { id: "msproject", name: "MS Project", description: "Projectplanning en tijdlijnen", icon: Calendar },
  { id: "exact", name: "Exact", description: "Financiële administratie", icon: Database },
  { id: "whatsapp", name: "WhatsApp", description: "Communicatie en berichten", icon: MessageSquare },
  { id: "asta", name: "Asta Powerproject", description: "Geavanceerde projectplanning", icon: Layers },
  { id: "revit", name: "Autodesk Revit", description: "BIM modeling en 3D ontwerp", icon: Box },
  { id: "solibri", name: "Solibri", description: "BIM kwaliteitscontrole", icon: CheckSquare },
  { id: "autocad", name: "AutoCAD", description: "2D/3D CAD tekeningen", icon: PenTool },
  { id: "bluebeam", name: "Bluebeam Revu", description: "PDF markup en samenwerking", icon: FileText },
  { id: "afas", name: "AFAS", description: "ERP systeem", icon: Calculator },
];

const ToolSelection = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleToolToggle = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleContinue = async () => {
    localStorage.setItem('selectedTools', JSON.stringify(selectedTools));
    
    // Haal huidige gebruiker op
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Verwijder bestaande tools voor deze gebruiker
      await supabase
        .from('user_tools')
        .delete()
        .eq('user_id', user.id);
      
      // Voeg nieuwe tools toe
      if (selectedTools.length > 0) {
        const toolsToInsert = selectedTools.map(toolId => ({
          user_id: user.id,
          tool_id: toolId
        }));
        
        await supabase
          .from('user_tools')
          .insert(toolsToInsert);
      }
    }
    
    navigate('/integraties');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-construction-primary mb-4">
            Selecteer je tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kies welke tools je momenteel gebruikt. We koppelen deze voor je aan één centraal dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTools.includes(tool.id);
            
            return (
              <Card 
                key={tool.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-construction-primary bg-construction-primary/5' : ''
                }`}
                onClick={() => handleToolToggle(tool.id)}
              >
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Checkbox 
                    checked={isSelected}
                    onChange={() => handleToolToggle(tool.id)}
                    className="mr-3"
                  />
                  <Icon className="h-6 w-6 text-construction-primary mr-2" />
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            onClick={handleContinue}
            disabled={selectedTools.length === 0}
            size="lg"
            className="px-8"
          >
            Doorgaan met {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolSelection;