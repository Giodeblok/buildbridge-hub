# Azure App Registration Setup voor Microsoft OAuth

## Stap 1: Azure Portal toegang

1. **Ga naar Azure Portal:**
   - Bezoek: https://portal.azure.com/
   - Log in met je Microsoft account

2. **App Registrations:**
   - Zoek naar "App registrations" in de zoekbalk
   - Klik op "App registrations"

## Stap 2: Nieuwe app registreren

1. **Nieuwe registratie:**
   - Klik op "New registration"
   - Naam: "BouwConnect Integration"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web > `http://localhost:4000/msproject/callback`

2. **App instellen:**
   - Ga naar "Overview"
   - Kopieer je **Application (client) ID**
   - Ga naar "Certificates & secrets"
   - Maak een nieuwe "Client secret" aan
   - Kopieer de **Value** (niet de ID!)

## Stap 3: API Permissions instellen

1. **Microsoft Graph permissions:**
   - Ga naar "API permissions"
   - Klik op "Add a permission"
   - Selecteer "Microsoft Graph"
   - Kies "Delegated permissions"
   - Voeg toe:
     - `User.Read`
     - `Tasks.Read`
     - `Project.Read.All`
     - `Files.Read`

2. **Admin consent:**
   - Klik op "Grant admin consent for [your-tenant]"

## Stap 4: Authentication configureren

1. **Redirect URIs:**
   - Ga naar "Authentication"
   - Voeg toe:
     - `http://localhost:4000/msproject/callback`
     - `http://localhost:4000/excel/callback`

2. **Advanced settings:**
   - Zet "Allow public client flows" aan
   - Sla op

## Environment Variables die je nodig hebt:

```
MICROSOFT_CLIENT_ID=jouw_application_client_id_hier
MICROSOFT_CLIENT_SECRET=jouw_client_secret_value_hier
```

## Testen:

1. **Test OAuth flow:**
   - Ga naar: `http://localhost:4000/msproject/auth`
   - Je zou naar Microsoft login moeten worden doorgestuurd
   - Na login krijg je een access token terug

## Belangrijke URLs:
- **Azure Portal:** https://portal.azure.com/
- **App Registrations:** https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
- **Microsoft Graph Explorer:** https://developer.microsoft.com/en-us/graph/graph-explorer 