# Echte AutoCAD API Integratie Setup

## Wat is er geïmplementeerd?

De dashboard haalt nu **echte AutoCAD bestanden** op via de Autodesk Forge API in plaats van mock data. Dit betekent:

- ✅ Echte DWG bestanden uit je AutoCAD projecten
- ✅ Echte bestandsgrootte en metadata
- ✅ Download functionaliteit voor bestanden
- ✅ Preview functionaliteit voor bestanden
- ✅ Automatische fallback naar mock data bij API problemen

## Stap 1: Autodesk Forge App Setup

1. **Ga naar Autodesk Forge Developer Portal:**
   - https://forge.autodesk.com/
   - Log in met je Autodesk account

2. **Maak een nieuwe app:**
   - Ga naar "My Apps"
   - Klik "Create App"
   - Naam: "BouwConnect AutoCAD Integration"
   - Beschrijving: "AutoCAD integration for construction project management"

3. **Configureer API Permissions:**
   - Ga naar "APIs & Services"
   - Voeg toe: "Data Management API"
   - Voeg toe: "Model Derivative API"
   - Voeg toe: "OSS API"

4. **Stel OAuth 2.0 in:**
   - Redirect URI: `http://localhost:4000/autocad/callback`
   - Scopes: `data:read data:write bucket:create bucket:read`

## Stap 2: Environment Variables

Voeg deze toe aan je `.env` bestand:

```env
AUTODESK_CLIENT_ID=jouw_autodesk_client_id_hier
AUTODESK_CLIENT_SECRET=jouw_autodesk_client_secret_hier
```

## Stap 3: Test de Integratie

1. **Start de server:**
   ```bash
   node server.js
   ```

2. **Ga naar de dashboard:**
   - Log in op je website
   - Ga naar Dashboard
   - Koppel AutoCAD via Integrations pagina

3. **Controleer de logs:**
   - De server toont nu: "Fetching real AutoCAD files from Autodesk Forge API..."
   - Als er echte bestanden zijn: "Found X buckets" en "Found X files in bucket Y"
   - Als geen bestanden: "No real files found, using mock data"

## Hoe het werkt

### 1. Buckets (Projecten/Werkruimtes)
De API haalt eerst alle "buckets" op - dit zijn je AutoCAD projecten of werkruimtes.

### 2. Bestanden per Bucket
Voor elke bucket worden alle bestanden opgehaald en gefilterd op AutoCAD bestanden:
- `.dwg` - AutoCAD Drawing
- `.dxf` - Drawing Exchange Format
- `.dwl` - AutoCAD Drawing Lock
- `.dwl2` - AutoCAD Drawing Lock v2

### 3. Metadata Extractie
Voor elk bestand wordt opgehaald:
- Bestandsnaam en extensie
- Bestandsgrootte (geformatteerd als KB/MB/GB)
- Laatste wijzigingsdatum
- Project/bucket naam
- Unieke object ID

### 4. Download & Preview
- **Download**: Genereert een signed URL voor directe download
- **Preview**: Haalt thumbnail/preview op via Model Derivative API

## Troubleshooting

### "No real files found"
- Controleer of je Autodesk account AutoCAD bestanden heeft
- Controleer of je app de juiste API permissions heeft
- Controleer of je access token geldig is

### "API permissions pending"
- Zorg dat je app is goedgekeurd door Autodesk
- Controleer of alle benodigde APIs zijn toegevoegd
- Wacht 24-48 uur na app registratie

### "Failed to fetch projects"
- Controleer je Client ID en Secret
- Controleer of je callback URL correct is
- Controleer of je scopes correct zijn ingesteld

## API Endpoints

### GET `/autocad/files`
Haalt alle AutoCAD bestanden op van alle buckets.

### GET `/autocad/files/:fileId/download`
Genereert download URL voor specifiek bestand.

### GET `/autocad/files/:fileId/preview`
Haalt preview/thumbnail op voor specifiek bestand.

## Voordelen van Echte API

1. **Realtime Data**: Altijd de meest recente bestanden
2. **Echte Metadata**: Correcte bestandsgrootte en datums
3. **Download Functionaliteit**: Direct downloaden van bestanden
4. **Preview Functionaliteit**: Bekijken van bestanden zonder download
5. **Project Organisatie**: Bestanden gegroepeerd per project/bucket
6. **Schalbaarheid**: Werkt met duizenden bestanden

## Volgende Stappen

- [ ] Implementeer bestand upload functionaliteit
- [ ] Voeg bestand versie beheer toe
- [ ] Implementeer bestand zoeken en filteren
- [ ] Voeg collaboratie features toe (comments, markups)
- [ ] Integreer met andere Autodesk tools (Revit, Inventor) 