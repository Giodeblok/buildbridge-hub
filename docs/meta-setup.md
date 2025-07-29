# Meta Developer Account Setup voor WhatsApp Business API

## Stap 1: Meta Developer Account aanmaken

1. **Ga naar Meta for Developers:**
   - Bezoek: https://developers.facebook.com/
   - Klik op "Get Started" of "Log In"

2. **Account aanmaken:**
   - Gebruik je Facebook account of maak een nieuwe aan
   - Vul je bedrijfsgegevens in
   - Verifieer je email adres

## Stap 2: App aanmaken

1. **Nieuwe app maken:**
   - Klik op "Create App"
   - Selecteer "Business" als app type
   - Geef je app een naam (bijv. "BouwConnect WhatsApp Integration")
   - Vul je contact email in

2. **App instellen:**
   - Ga naar "App Settings" > "Basic"
   - Kopieer je **App ID** en **App Secret**
   - Voeg je website URL toe: `http://localhost:4000`

## Stap 3: WhatsApp Business API activeren

1. **Product toevoegen:**
   - Ga naar "Add Product"
   - Zoek naar "WhatsApp" en klik "Set Up"

2. **WhatsApp Business API configureren:**
   - Ga naar "WhatsApp" in het linker menu
   - Klik op "Getting Started"
   - Volg de setup wizard

3. **Webhook configureren:**
   - Ga naar "Configuration" > "Webhooks"
   - Voeg URL toe: `http://localhost:4000/whatsapp/webhook`
   - Verify token: `your-verify-token`

## Stap 4: Permissions instellen

1. **App Permissions:**
   - Ga naar "App Review" > "Permissions and Features"
   - Voeg toe: `whatsapp_business_management`
   - Voeg toe: `whatsapp_business_messaging`

2. **OAuth Redirect URIs:**
   - Ga naar "Facebook Login" > "Settings"
   - Voeg toe: `http://localhost:4000/whatsapp/callback`

## Stap 5: Testen

1. **Test je integratie:**
   - Gebruik de Meta Graph API Explorer
   - Test de `/me/accounts` endpoint
   - Controleer of je WhatsApp Business accounts zichtbaar zijn

## Belangrijke URLs:
- **App Dashboard:** https://developers.facebook.com/apps/
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **WhatsApp Business API Docs:** https://developers.facebook.com/docs/whatsapp

## Environment Variables die je nodig hebt:
```
WHATSAPP_CLIENT_ID=jouw_app_id_hier
WHATSAPP_CLIENT_SECRET=jouw_app_secret_hier
``` 