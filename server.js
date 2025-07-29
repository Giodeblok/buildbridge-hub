import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'dev_secret';
const MOCK_USER = { email: 'test@demo.nl', password: 'test123', id: 1, name: 'Demo User' };

// Mock config, vervang door echte waarden uit Azure Portal voor productie
const default_client_id = 'mock-client-id';
const default_client_secret = 'mock-client-secret';
const default_redirect_uri = 'http://localhost:4000/msproject/callback';

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    const token = jwt.sign({ id: MOCK_USER.id, email: MOCK_USER.email, name: MOCK_USER.name }, SECRET, { expiresIn: '2h' });
    return res.json({ token, user: { id: MOCK_USER.id, email: MOCK_USER.email, name: MOCK_USER.name } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const user = jwt.verify(token, SECRET);
    res.json({ user });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Echte Microsoft OAuth configuratie
// Vervang deze waarden door je eigen Azure App Registration gegevens
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id';
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret';
const MICROSOFT_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/msproject/callback` : 'http://localhost:4000/msproject/callback';
const MS_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MS_SCOPES = 'offline_access user.read Tasks.Read Project.Read.All';

app.get('/msproject/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: MICROSOFT_REDIRECT_URI,
    response_mode: 'query',
    scope: MS_SCOPES,
    state: state
  });
  res.redirect(`${MS_AUTH_URL}?${params}`);
});

app.get('/msproject/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    // Wissel authorization code om voor access token
    const tokenResponse = await axios.post(MS_TOKEN_URL, querystring.stringify({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri: MICROSOFT_REDIRECT_URI,
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Stuur token terug naar frontend
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          msproject_token: '${access_token}',
          msproject_refresh_token: '${refresh_token}',
          msproject_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.status(500).send('OAuth authentication failed');
  }
});

// Echte Microsoft Graph API endpoint voor projecten
app.get('/msproject/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Haal projecten op via Microsoft Graph API
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/tasks/lists', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Transformeer naar ons formaat
    const projects = response.data.value.map((list, index) => ({
      id: list.id,
      name: list.displayName || `Project ${index + 1}`,
      status: 'on-track',
      progress: Math.floor(Math.random() * 100)
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Graph API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch projects from Microsoft Graph' });
  }
});

// In-memory store voor gekoppelde tools per user (tijdelijke oplossing)
const userTools = {};

// In-memory store voor OAuth tokens (in productie: gebruik database)
const userTokens = {};

app.post('/user/tools', (req, res) => {
  const { userId, tools } = req.body;
  if (!userId || !Array.isArray(tools)) return res.status(400).json({ error: 'userId en tools verplicht' });
  userTools[userId] = tools;
  res.json({ success: true });
});

app.get('/user/tools', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId verplicht' });
  res.json({ tools: userTools[userId] || [] });
});

// Endpoint om OAuth tokens op te slaan
app.post('/user/tokens', (req, res) => {
  const { userId, toolId, accessToken, refreshToken, expiresIn } = req.body;
  if (!userId || !toolId || !accessToken) {
    return res.status(400).json({ error: 'userId, toolId en accessToken verplicht' });
  }
  
  userTokens[userId] = userTokens[userId] || {};
  userTokens[userId][toolId] = {
    accessToken,
    refreshToken,
    expiresIn,
    createdAt: new Date().toISOString()
  };
  
  res.json({ success: true });
});

// Endpoint om OAuth tokens op te halen
app.get('/user/tokens/:userId/:toolId', (req, res) => {
  const { userId, toolId } = req.params;
  const userToken = userTokens[userId]?.[toolId];
  
  if (!userToken) {
    return res.status(404).json({ error: 'Token niet gevonden' });
  }
  
  res.json(userToken);
});

// Echte Autodesk OAuth configuratie
const AUTODESK_CLIENT_ID = process.env.AUTODESK_CLIENT_ID || 'your-autodesk-client-id';
const AUTODESK_CLIENT_SECRET = process.env.AUTODESK_CLIENT_SECRET || 'your-autodesk-client-secret';
const AUTODESK_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/autocad/callback` : 'http://localhost:4000/autocad/callback';
const AUTODESK_AUTH_URL = 'https://developer.api.autodesk.com/authentication/v2/authorize';
const AUTODESK_TOKEN_URL = 'https://developer.api.autodesk.com/authentication/v2/token';
const AUTODESK_SCOPES = 'data:read data:write bucket:create bucket:read';

// --- AutoCAD OAuth (echte Autodesk Forge API) ---
app.get('/autocad/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: AUTODESK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: AUTODESK_REDIRECT_URI,
    scope: AUTODESK_SCOPES,
    state: state
  });
  res.redirect(`${AUTODESK_AUTH_URL}?${params}`);
});

app.get('/autocad/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    // Wissel authorization code om voor access token
    const tokenResponse = await axios.post(AUTODESK_TOKEN_URL, querystring.stringify({
      client_id: AUTODESK_CLIENT_ID,
      client_secret: AUTODESK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: AUTODESK_REDIRECT_URI
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          autocad_token: '${access_token}',
          autocad_refresh_token: '${refresh_token}',
          autocad_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Autodesk OAuth error:', error.response?.data || error.message);
    res.status(500).send('Autodesk OAuth authentication failed');
  }
});

app.get('/autocad/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  // Tijdelijke oplossing: gebruik altijd mock data tot API permissions zijn opgelost
  console.log('Using mock data for AutoCAD projects (API permissions pending)');
  res.json({
    projects: [
      { id: 101, name: 'AutoCAD Project A', status: 'on-track', progress: 60 },
      { id: 102, name: 'AutoCAD Project B', status: 'delayed', progress: 30 },
      { id: 103, name: 'AutoCAD Project C', status: 'ahead', progress: 85 }
    ]
  });

  /* 
  // Echte API call (uncomment wanneer API permissions zijn opgelost)
  try {
    const response = await axios.get('https://developer.api.autodesk.com/data/v1/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const projects = response.data.data.map((project, index) => ({
      id: project.id,
      name: project.attributes.name || `AutoCAD Project ${index + 1}`,
      status: 'on-track',
      progress: Math.floor(Math.random() * 100)
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Autodesk API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch projects from Autodesk API' });
  }
  */
});

// --- Revit OAuth mock ---
const REVIT_TOKEN = 'mock-revit-token';

app.get('/revit/auth', (req, res) => {
  // In productie: redirect naar echte Revit OAuth
  res.redirect('/revit/callback?code=mockcode');
});

app.get('/revit/callback', (req, res) => {
  // In productie: wissel code om voor token
  res.send(`<script>window.opener && window.opener.postMessage({ revit_token: '${REVIT_TOKEN}' }, '*'); window.close();</script>`);
});

app.get('/revit/projects', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== REVIT_TOKEN) {
    return res.status(401).json({ error: 'No valid Revit token' });
  }
  res.json({
    projects: [
      { id: 201, name: 'Revit Project X', status: 'on-track', progress: 75 },
      { id: 202, name: 'Revit Project Y', status: 'ahead', progress: 90 }
    ]
  });
});

// --- Excel OAuth (via Microsoft Graph API) ---
const EXCEL_TOKEN = 'mock-excel-token';

app.get('/excel/auth', (req, res) => {
  // Gebruik dezelfde Microsoft OAuth flow als MS Project
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/excel/callback` : 'http://localhost:4000/excel/callback',
    response_mode: 'query',
    scope: MS_SCOPES,
    state: state
  });
  res.redirect(`${MS_AUTH_URL}?${params}`);
});

app.get('/excel/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    const tokenResponse = await axios.post(MS_TOKEN_URL, querystring.stringify({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/excel/callback` : 'http://localhost:4000/excel/callback',
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          excel_token: '${access_token}',
          excel_refresh_token: '${refresh_token}',
          excel_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Excel OAuth error:', error.response?.data || error.message);
    res.status(500).send('Excel OAuth authentication failed');
  }
});

app.get('/excel/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Haal Excel bestanden op via Microsoft Graph API
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/drive/root/children?$filter=file ne null and endswith(name,\'.xlsx\')', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const projects = response.data.value.map((file, index) => ({
      id: file.id,
      name: file.name.replace('.xlsx', ''),
      status: 'on-track',
      progress: Math.floor(Math.random() * 100)
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Excel API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Excel files' });
  }
});

// --- WhatsApp OAuth (Meta API) ---
const WHATSAPP_CLIENT_ID = process.env.WHATSAPP_CLIENT_ID || 'your-whatsapp-client-id';
const WHATSAPP_CLIENT_SECRET = process.env.WHATSAPP_CLIENT_SECRET || 'your-whatsapp-client-secret';
const WHATSAPP_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/whatsapp/callback` : 'http://localhost:4000/whatsapp/callback';
const WHATSAPP_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';

app.get('/whatsapp/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: WHATSAPP_CLIENT_ID,
    redirect_uri: WHATSAPP_REDIRECT_URI,
    scope: 'whatsapp_business_management',
    response_type: 'code',
    state: state
  });
  res.redirect(`${WHATSAPP_AUTH_URL}?${params}`);
});

app.get('/whatsapp/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    // Wissel code om voor access token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${WHATSAPP_CLIENT_ID}&client_secret=${WHATSAPP_CLIENT_SECRET}&code=${code}&redirect_uri=${WHATSAPP_REDIRECT_URI}`);
    
    const { access_token, expires_in } = tokenResponse.data;
    
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          whatsapp_token: '${access_token}',
          whatsapp_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('WhatsApp OAuth error:', error.response?.data || error.message);
    res.status(500).send('WhatsApp OAuth authentication failed');
  }
});

app.get('/whatsapp/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Haal WhatsApp Business accounts op
    const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const projects = response.data.data.map((account, index) => ({
      id: account.id,
      name: account.name || `WhatsApp Project ${index + 1}`,
      status: 'on-track',
      progress: Math.floor(Math.random() * 100)
    }));

    res.json({ projects });
  } catch (error) {
    console.error('WhatsApp API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch WhatsApp data' });
  }
});

app.listen(4000, () => {
  console.log('Auth server running on http://localhost:4000');
}); 