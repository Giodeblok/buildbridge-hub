# Localtunnel Setup voor OAuth Testing

## Wat is localtunnel?
Localtunnel is een eenvoudige tool die je localhost exposeert via een publieke URL, zonder account nodig!

## Stap 1: Localtunnel installeren
```bash
npm install -g localtunnel
```

## Stap 2: Server starten
```bash
# Terminal 1: Start je backend server
node server.js
```

## Stap 3: Localtunnel starten
```bash
# Terminal 2: Start localtunnel voor backend
lt --port 4000
```

## Stap 4: URL kopiëren
Localtunnel geeft je een URL zoals: `https://abc123.loca.lt`

## Stap 5: Environment variable toevoegen
```bash
echo "NGROK_URL=https://abc123.loca.lt" >> .env.local
```

## Stap 6: OAuth URLs updaten

### Voor Autodesk (AutoCAD):
1. Ga naar: https://forge.autodesk.com/myapps
2. Update je app's callback URL naar: `https://abc123.loca.lt/autocad/callback`

### Voor Microsoft (MS Project/Excel):
1. Ga naar: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
2. Update redirect URIs naar:
   - `https://abc123.loca.lt/msproject/callback`
   - `https://abc123.loca.lt/excel/callback`

### Voor Meta (WhatsApp):
1. Ga naar: https://developers.facebook.com/apps/
2. Update OAuth redirect URIs naar: `https://abc123.loca.lt/whatsapp/callback`

## Stap 7: Testen
1. Start je frontend: `npm run dev`
2. Ga naar je app
3. Probeer OAuth koppeling

## Voordelen van localtunnel:
- ✅ Geen account nodig
- ✅ Eenvoudig te gebruiken
- ✅ Gratis
- ✅ Geen configuratie nodig

## Troubleshooting:
- **URL verandert elke keer:** Dat is normaal met localtunnel
- **OAuth errors:** Controleer of callback URLs exact overeenkomen
- **CORS errors:** Zorg dat je frontend ook via localtunnel draait

## Voorbeeld workflow:
1. Start backend: `node server.js`
2. Start localtunnel: `lt --port 4000`
3. Kopieer URL (bijv. `https://abc123.loca.lt`)
4. Update OAuth provider met nieuwe callback URL
5. Test OAuth flow in je app 