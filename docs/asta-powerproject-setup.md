# Asta Powerproject API Integratie Setup

## Wat is er geïmplementeerd?

De dashboard haalt nu **Asta Powerproject bestanden** op via de Asta API in plaats van mock data. Dit betekent:

- ✅ Echte AST bestanden uit je Asta Powerproject projecten
- ✅ Echte bestandsgrootte en metadata
- ✅ Download functionaliteit voor bestanden
- ✅ Preview functionaliteit voor bestanden
- ✅ Automatische fallback naar mock data bij API problemen

## Stap 1: Asta Powerproject API Setup

1. **Ga naar Asta Powerproject Developer Portal:**
   - https://developer.astapowerproject.com/
   - Log in met je Asta Powerproject account

2. **Maak een nieuwe app:**
   - Ga naar "My Apps"
   - Klik "Create App"
   - Naam: "BouwConnect Asta Integration"
   - Beschrijving: "Asta Powerproject integration for construction project management"

3. **Configureer API Permissions:**
   - Ga naar "APIs & Services"
   - Voeg toe: "Project Management API"
   - Voeg toe: "File Management API"
   - Voeg toe: "Resource Planning API"

4. **Stel OAuth 2.0 in:**
   - Redirect URI: `http://localhost:4000/asta/callback`
   - Scopes: `read write`

## Stap 2: Environment Variables

Voeg deze toe aan je `.env` bestand:

```env
ASTA_CLIENT_ID=jouw_asta_client_id_hier
ASTA_CLIENT_SECRET=jouw_asta_client_secret_hier
```

## Stap 3: Test de Integratie

1. **Start de server:**
   ```bash
   node server.js
   ```

2. **Ga naar de dashboard:**
   - Log in op je website
   - Ga naar Dashboard
   - Koppel Asta Powerproject via Integrations pagina

3. **Controleer de logs:**
   - De server toont nu: "Using mock data for Asta Powerproject files (API permissions pending)"
   - Als er echte bestanden zijn: "Found X projects" en "Found X files"
   - Als geen bestanden: "No real files found, using mock data"

## Hoe het werkt

### 1. Projecten (Planning Projecten)
De API haalt eerst alle Asta Powerproject projecten op - dit zijn je planning projecten.

### 2. Bestanden per Project
Voor elk project worden alle bestanden opgehaald en gefilterd op Asta bestanden:
- `.ast` - Asta Powerproject File
- `.astx` - Asta Powerproject Export
- `.astm` - Asta Powerproject Model

### 3. Metadata Extractie
Voor elk bestand wordt opgehaald:
- Bestandsnaam en extensie
- Bestandsgrootte (geformatteerd als KB/MB/GB)
- Laatste wijzigingsdatum
- Project naam
- Unieke object ID

### 4. Download & Preview
- **Download**: Genereert een download URL voor directe download
- **Preview**: Haalt preview op via Asta API

## API Endpoints

### GET `/asta/projects`
Haalt alle Asta Powerproject projecten op.

### GET `/asta/files`
Haalt alle Asta Powerproject bestanden op van alle projecten.

### GET `/asta/files/:fileId/download`
Genereert download URL voor specifiek bestand.

### GET `/asta/files/:fileId/preview`
Haalt preview op voor specifiek bestand.

## Mock Data

Momenteel wordt mock data gebruikt omdat de echte Asta Powerproject API nog niet beschikbaar is. De mock data bevat:

- **Projecten:**
  - Wooncomplex Amstelveen - Planning
  - Kantoorgebouw Rotterdam - Bouwplanning
  - Renovatie School Utrecht - Planning

- **Bestanden:**
  - Wooncomplex_Planning.ast (3.2 MB)
  - Resource_Planning.ast (1.8 MB)
  - Kantoorgebouw_Planning.ast (2.1 MB)
  - School_Renovatie_Planning.ast (1.5 MB)

## Troubleshooting

### "API permissions pending"
- Controleer of je app is goedgekeurd door Asta
- Controleer of alle benodigde APIs zijn toegevoegd
- Wacht 24-48 uur na app registratie

### "Failed to fetch projects"
- Controleer je Client ID en Secret
- Controleer of je callback URL correct is
- Controleer of je scopes correct zijn ingesteld

### "No real files found"
- Controleer of je Asta account projecten heeft
- Controleer of je app de juiste API permissions heeft
- Controleer of je access token geldig is

## Voordelen van Asta Powerproject Integratie

1. **Planning Integratie**: Directe koppeling met bouwplanning
2. **Resource Management**: Inzicht in resource planning
3. **Project Tracking**: Realtime project voortgang
4. **File Management**: Centraal beheer van planning bestanden
5. **Collaboration**: Samenwerking op planning niveau
6. **Reporting**: Geautomatiseerde rapportages

## Volgende Stappen

- [ ] Implementeer echte Asta Powerproject API calls
- [ ] Voeg resource planning integratie toe
- [ ] Implementeer planning export functionaliteit
- [ ] Voeg Gantt chart visualisatie toe
- [ ] Integreer met andere planning tools
- [ ] Voeg planning analytics toe

## Verschil met AutoCAD Integratie

| Feature | AutoCAD | Asta Powerproject |
|---------|---------|-------------------|
| **Bestandstype** | DWG/DXF | AST/ASTX |
| **Doel** | Tekeningen | Planning |
| **API Type** | Autodesk Forge | Asta API |
| **Data** | Geometrie & Metadata | Planning & Resources |
| **Preview** | 2D/3D Viewer | Gantt Chart |
| **Download** | Direct File | Planning Export | 