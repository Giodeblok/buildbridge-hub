import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface TrialDialogProps {
  children: React.ReactNode;
}

const TrialDialog = ({ children }: TrialDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trial request logic here
    console.log("Trial request:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-construction-primary">
            Gratis proefversie aanvragen
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naam *</Label>
            <Input
              id="name"
              placeholder="Jouw naam"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jouw@bedrijf.nl"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Bedrijfsnaam *</Label>
            <Input
              id="company"
              placeholder="Jouw bouwbedrijf"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="06-12345678"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Bericht (optioneel)</Label>
            <Textarea
              id="message"
              placeholder="Vertel ons over je huidige workflow en welke tools je gebruikt..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Proefversie aanvragen
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrialDialog;