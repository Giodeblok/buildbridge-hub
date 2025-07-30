# 🚀 Vercel Deployment Guide

## Stap 1: Voorbereiding

### 1.1 GitHub Repository
- Zorg dat je code in een GitHub repository staat
- Commit en push alle wijzigingen

### 1.2 Environment Variables
Maak een `.env.local` bestand aan met je productie environment variables:

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Andere OAuth providers
AUTOCAD_CLIENT_ID=your-autocad-client-id
AUTOCAD_CLIENT_SECRET=your-autocad-client-secret
ASTA_CLIENT_ID=your-asta-client-id
ASTA_CLIENT_SECRET=your-asta-client-secret
BLUEBEAM_CLIENT_ID=your-bluebeam-client-id
BLUEBEAM_CLIENT_SECRET=your-bluebeam-client-secret
WHATSAPP_CLIENT_ID=your-whatsapp-client-id
WHATSAPP_CLIENT_SECRET=your-whatsapp-client-secret
```

## Stap 2: Vercel Account Setup

### 2.1 Account Aanmaken
1. Ga naar [vercel.com](https://vercel.com)
2. Klik op "Sign Up"
3. Kies "Continue with GitHub"
4. Autoriseer Vercel toegang tot je GitHub account

### 2.2 Project Importeren
1. Klik op "New Project"
2. Selecteer je GitHub repository
3. Klik op "Import"

## Stap 3: Project Configuratie

### 3.1 Build Settings
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.2 Environment Variables
Voeg alle environment variables toe in Vercel:

1. Ga naar je project dashboard
2. Klik op "Settings" → "Environment Variables"
3. Voeg elke variabele toe uit je `.env.local` bestand

### 3.3 Domain Configuratie
1. Ga naar "Settings" → "Domains"
2. Voeg je custom domain toe (optioneel)
3. Update de `vercel.json` met je echte domain:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

## Stap 4: OAuth Redirect URLs

### 4.1 Microsoft Azure Portal
1. Ga naar [portal.azure.com](https://portal.azure.com)
2. Ga naar "Azure Active Directory" → "App registrations"
3. Selecteer je app
4. Ga naar "Authentication"
5. Voeg redirect URI toe: `https://your-app-name.vercel.app/api/msproject/callback`
6. Voeg redirect URI toe: `https://your-app-name.vercel.app/api/excel/callback`

### 4.2 Andere OAuth Providers
Doe hetzelfde voor andere providers:
- AutoCAD: `https://your-app-name.vercel.app/api/autocad/callback`
- Asta: `https://your-app-name.vercel.app/api/asta/callback`
- Bluebeam: `https://your-app-name.vercel.app/api/bluebeam/callback`
- WhatsApp: `https://your-app-name.vercel.app/api/whatsapp/callback`

## Stap 5: Deployen

### 5.1 Eerste Deploy
1. Klik op "Deploy" in Vercel
2. Wacht tot de build klaar is
3. Test je applicatie

### 5.2 Automatische Deploys
- Elke push naar `main` branch triggert automatisch een nieuwe deploy
- Je kunt preview deploys maken voor andere branches

## Stap 6: Testing

### 6.1 Functionaliteit Testen
1. Test alle OAuth flows
2. Test bestand uploads/downloads
3. Test Supabase integratie
4. Test alle pagina's

### 6.2 Performance
1. Check Vercel Analytics
2. Monitor error logs
3. Test op verschillende devices

## Stap 7: Custom Domain (Optioneel)

### 7.1 Domain Toevoegen
1. Ga naar "Settings" → "Domains"
2. Voeg je custom domain toe
3. Update DNS records volgens Vercel instructies

### 7.2 SSL Certificate
- Vercel regelt automatisch SSL certificaten
- Force HTTPS in je app

## Troubleshooting

### Veelvoorkomende Problemen

1. **Build Errors**
   - Check build logs in Vercel
   - Test lokaal met `npm run build`

2. **Environment Variables**
   - Zorg dat alle variabelen correct zijn ingesteld
   - Check of namen exact kloppen

3. **OAuth Errors**
   - Controleer redirect URLs
   - Test met incognito browser

4. **API Errors**
   - Check Vercel function logs
   - Test API endpoints direct

### Support
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Monitoring

### 6.1 Vercel Analytics
- Ga naar "Analytics" in je dashboard
- Monitor performance metrics
- Check error rates

### 6.2 Logs
- Ga naar "Functions" → "View Function Logs"
- Monitor API calls en errors

## Updates

### 6.1 Code Updates
1. Push wijzigingen naar GitHub
2. Vercel deployt automatisch
3. Test na deployment

### 6.2 Environment Variables
1. Update in Vercel dashboard
2. Redeploy nodig voor wijzigingen
3. Test functionaliteit

---

**Succes met je deployment! 🎉** 