# Ngrok Setup voor OAuth Testing

## Wat is ngrok?
Ngrok exposeert je localhost via een publieke URL, zodat externe services (zoals OAuth providers) je app kunnen bereiken.

## Stap 1: Ngrok installeren
```bash
npm install -g ngrok
```

## Stap 2: Ngrok account aanmaken (gratis)
1. Ga naar: https://ngrok.com/
2. Maak een gratis account aan
3. Kopieer je authtoken

## Stap 3: Ngrok configureren
```bash
ngrok config add-authtoken JOUW_AUTH_TOKEN_HIER
```

## Stap 4: Server starten
```bash
# Terminal 1: Start je backend server
node server.js

# Terminal 2: Start ngrok voor backend
ngrok http 4000
```

## Stap 5: Frontend ook exposeren (optioneel)
```bash
# Terminal 3: Start je frontend
npm run dev

# Terminal 4: Start ngrok voor frontend
ngrok http 8080
```

## Stap 6: OAuth URLs updaten

### Voor Autodesk (AutoCAD):
1. Ga naar: https://forge.autodesk.com/myapps
2. Update je app's callback URL naar: `https://JOUW_NGROK_URL.ngrok.io/autocad/callback`

### Voor Microsoft (MS Project/Excel):
1. Ga naar: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
2. Update redirect URIs naar:
   - `https://JOUW_NGROK_URL.ngrok.io/msproject/callback`
   - `https://JOUW_NGROK_URL.ngrok.io/excel/callback`

### Voor Meta (WhatsApp):
1. Ga naar: https://developers.facebook.com/apps/
2. Update OAuth redirect URIs naar: `https://JOUW_NGROK_URL.ngrok.io/whatsapp/callback`

## Stap 7: Environment variables updaten
Update je `.env.local` met de ngrok URLs:

```bash
# Vervang localhost:4000 met je ngrok URL
NGROK_URL=https://JOUW_NGROK_URL.ngrok.io
```

## Belangrijke URLs:
- **Ngrok Dashboard:** https://dashboard.ngrok.com/
- **Ngrok Status:** https://ngrok.com/status
- **Ngrok Documentation:** https://ngrok.com/docs

## Troubleshooting:
- **URL verandert elke keer:** Gebruik een betaald ngrok account voor vaste URLs
- **CORS errors:** Zorg dat je frontend ook via ngrok draait
- **OAuth errors:** Controleer of callback URLs exact overeenkomen

## Voorbeeld workflow:
1. Start backend: `node server.js`
2. Start ngrok: `ngrok http 4000`
3. Kopieer ngrok URL (bijv. `https://abc123.ngrok.io`)
4. Update OAuth provider met nieuwe callback URL
5. Test OAuth flow in je app 