import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form:", formData);
    // Handle form submission
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
              <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-construction-primary mb-4">
            Contact
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vragen over onze oplossing? Ons team staat klaar om je te helpen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contactgegevens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-construction-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-muted-foreground">info@bouwintegratie.nl</p>
                    <p className="text-muted-foreground">support@bouwintegratie.nl</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-construction-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Telefoon</h3>
                    <p className="text-muted-foreground">+31 (0)20 123 4567</p>
                    <p className="text-sm text-muted-foreground">Maandag t/m vrijdag 9:00-17:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-construction-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Adres</h3>
                    <p className="text-muted-foreground">
                      Hoofdkantoor<br />
                      Bouwstraat 123<br />
                      1000 AB Amsterdam<br />
                      Nederland
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-construction-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Openingstijden</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Maandag - Vrijdag: 9:00 - 17:00</p>
                      <p>Zaterdag: 10:00 - 14:00</p>
                      <p>Zondag: Gesloten</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waarom contact opnemen?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Persoonlijke demonstratie van het platform</li>
                  <li>• Advies over welke integraties het beste passen</li>
                  <li>• Maatwerk configuratie voor jouw bedrijf</li>
                  <li>• Migratie ondersteuning van bestaande systemen</li>
                  <li>• Training voor jouw team</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Stuur ons een bericht</CardTitle>
            </CardHeader>
            <CardContent>
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
                    placeholder="jouw@email.nl"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Onderwerp *</Label>
                  <Input
                    id="subject"
                    placeholder="Waar gaat je vraag over?"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Bericht *</Label>
                  <Textarea
                    id="message"
                    placeholder="Vertel ons hoe we je kunnen helpen..."
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Verstuur bericht
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;