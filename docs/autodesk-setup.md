# Autodesk Developer Account Setup voor AutoCAD, Revit & Solibri OAuth

## Stap 1: Autodesk Developer Account aanmaken

1. **Ga naar Autodesk Forge:**
   - Bezoek: https://forge.autodesk.com/
   - Klik op "Get Started" of "Sign In"

2. **Account aanmaken:**
   - Gebruik je Autodesk account of maak een nieuwe aan
   - Vul je bedrijfsgegevens in
   - Verifieer je email adres

## Stap 2: App aanmaken

1. **Nieuwe app maken:**
   - Ga naar "My Apps" in het dashboard
   - Klik op "Create App"
   - Geef je app een naam (bijv. "BouwConnect AutoCAD Integration")
   - Beschrijving: "AutoCAD integration for construction project management"

2. **App instellen:**
   - Ga naar "App Settings"
   - Kopieer je **Client ID** en **Client Secret**
   - Voeg je callback URLs toe:
     - `http://localhost:4000/autocad/callback`
     - `http://localhost:4000/revit/callback`
     - `http://localhost:4000/solibri/callback`

## Stap 3: API Permissions instellen

1. **Data Management API:**
   - Ga naar "APIs & Services"
   - Voeg toe: "Data Management API"
   - Voeg toe: "Model Derivative API"

2. **Scopes configureren:**
   - Voeg de volgende scopes toe:
     - `data:read`
     - `data:write`
     - `bucket:create`
     - `bucket:read`

## Stap 4: OAuth 2.0 configureren

1. **Redirect URIs:**
   - Voeg toe: `http://localhost:4000/autocad/callback`
   - Voeg toe: `http://localhost:4000/revit/callback`
   - Voeg toe: `http://localhost:4000/solibri/callback`
   - Zorg dat deze exact overeenkomen

2. **Scopes voor OAuth:**
   - `data:read`
   - `data:write`
   - `bucket:create`
   - `bucket:read`

## Environment Variables die je nodig hebt:

```
AUTODESK_CLIENT_ID=jouw_autodesk_client_id_hier
AUTODESK_CLIENT_SECRET=jouw_autodesk_client_secret_hier
```

## Testen:

1. **Test AutoCAD OAuth flow:**
   - Ga naar: `http://localhost:4000/autocad/auth`
   - Je zou naar Autodesk login moeten worden doorgestuurd
   - Na login krijg je een access token terug

2. **Test Revit OAuth flow:**
   - Ga naar: `http://localhost:4000/revit/auth`
   - Gebruikt hetzelfde Autodesk account als AutoCAD
   - Na login krijg je een access token terug

3. **Test Solibri OAuth flow:**
   - Ga naar: `http://localhost:4000/solibri/auth`
   - Gebruikt hetzelfde Autodesk account als AutoCAD/Revit
   - Na login krijg je een access token terug

## Belangrijke informatie:

**Gedeeld Autodesk Account:** Omdat AutoCAD, Revit en Solibri allemaal van Autodesk zijn, kunnen ze hetzelfde Autodesk account gebruiken. Dit betekent:
- Eén keer inloggen voor alle drie de tools
- Gedeelde projecten en bestanden
- Consistente authenticatie
- BIM workflow integratie (AutoCAD → Revit → Solibri)

## Belangrijke URLs:
- **Autodesk Forge:** https://forge.autodesk.com/
- **My Apps:** https://forge.autodesk.com/myapps
- **API Reference:** https://forge.autodesk.com/en/docs/oauth/v2/overview/
- **Data Management API:** https://forge.autodesk.com/en/docs/data/v2/overview/ 