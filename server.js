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

// Railway gebruikt process.env.PORT
const PORT = process.env.PORT || 4000;

// Health check endpoint voor Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      msproject: MICROSOFT_CLIENT_ID !== 'your-microsoft-client-id',
      autocad: true,
      asta: true,
      revit: true
    }
  });
});

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
const MICROSOFT_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/msproject/callback` : 'https://shaky-dots-hope.loca.lt/msproject/callback';
const MS_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MS_SCOPES = 'offline_access user.read Tasks.Read Project.Read.All';

app.get('/msproject/auth', (req, res) => {
  // Check of Microsoft Client ID is geconfigureerd
  if (!MICROSOFT_CLIENT_ID || MICROSOFT_CLIENT_ID === 'your-microsoft-client-id') {
    return res.status(400).json({ 
      error: 'Microsoft Client ID niet geconfigureerd',
      message: 'Voeg MICROSOFT_CLIENT_ID toe aan je environment variables'
    });
  }

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
const AUTODESK_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/autocad/callback` : 'https://buildbridge-hub-api.loca.lt/autocad/callback';
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
      { id: 101, name: 'Wooncomplex Amstelveen - Bouwkundig', status: 'on-track', progress: 75 },
      { id: 102, name: 'Kantoorgebouw Rotterdam - Installaties', status: 'delayed', progress: 45 },
      { id: 103, name: 'Renovatie School Utrecht - Constructie', status: 'ahead', progress: 90 }
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

// Nieuwe endpoint voor AutoCAD bestanden
app.get('/autocad/files', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    console.log('Fetching real AutoCAD files from Autodesk Forge API...');
    
    // Eerst haal buckets op (projecten/werkruimtes)
    const bucketsResponse = await axios.get('https://developer.api.autodesk.com/oss/v2/buckets', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const buckets = bucketsResponse.data.items || [];
    console.log(`Found ${buckets.length} buckets`);

    let allFiles = [];

    // Voor elke bucket, haal bestanden op
    for (const bucket of buckets) {
      try {
        const objectsResponse = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${bucket.bucketKey}/objects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const bucketFiles = objectsResponse.data.items || [];
        console.log(`Found ${bucketFiles.length} files in bucket ${bucket.bucketKey}`);

        // Filter alleen AutoCAD bestanden
        const autocadFiles = bucketFiles.filter(file => {
          const extension = file.objectKey.split('.').pop()?.toLowerCase();
          return ['dwg', 'dxf', 'dwl', 'dwl2'].includes(extension);
        });

        // Converteer naar ons formaat
        const convertedFiles = autocadFiles.map(file => ({
          id: file.objectId,
          name: file.objectKey,
          type: file.objectKey.split('.').pop()?.toUpperCase() || 'DWG',
          size: formatFileSize(file.size),
          lastModified: file.location,
          status: 'active',
          project: bucket.bucketKey,
          location: file.location,
          etag: file.etag
        }));

        allFiles = [...allFiles, ...convertedFiles];
      } catch (bucketError) {
        console.error(`Error fetching files from bucket ${bucket.bucketKey}:`, bucketError.message);
        // Ga door met volgende bucket
      }
    }

    // Als geen echte bestanden gevonden, gebruik mock data
    if (allFiles.length === 0) {
      console.log('No real files found, using mock data');
      allFiles = [
        {
          id: 'ac-001',
          name: 'Plattegrond_BG.dwg',
          type: 'DWG',
          size: '2.4 MB',
          lastModified: '2024-02-14T10:30:00Z',
          status: 'active',
          project: 'Wooncomplex Amstelveen'
        },
        {
          id: 'ac-002',
          name: 'Sectie_A-A.dwg',
          type: 'DWG',
          size: '1.8 MB',
          lastModified: '2024-02-13T15:45:00Z',
          status: 'active',
          project: 'Wooncomplex Amstelveen'
        },
        {
          id: 'ac-003',
          name: 'Details_Fundering.dwg',
          type: 'DWG',
          size: '3.1 MB',
          lastModified: '2024-02-12T09:20:00Z',
          status: 'active',
          project: 'Wooncomplex Amstelveen'
        }
      ];
    }

    res.json({ files: allFiles });
  } catch (error) {
    console.error('Error fetching AutoCAD files:', error.response?.data || error.message);
    
    // Fallback naar mock data bij error
    res.json({
      files: [
        {
          id: 'ac-001',
          name: 'Plattegrond_BG.dwg',
          type: 'DWG',
          size: '2.4 MB',
          lastModified: '2024-02-14T10:30:00Z',
          status: 'active',
          project: 'Wooncomplex Amstelveen'
        },
        {
          id: 'ac-002',
          name: 'Sectie_A-A.dwg',
          type: 'DWG',
          size: '1.8 MB',
          lastModified: '2024-02-13T15:45:00Z',
          status: 'active',
          project: 'Wooncomplex Amstelveen'
        }
      ]
    });
  }
});

// Helper functie om bestandsgrootte te formatteren
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Endpoint om AutoCAD bestand te downloaden
app.get('/autocad/files/:fileId/download', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { fileId } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No access token provided' });
  if (!fileId) return res.status(400).json({ error: 'No file ID provided' });

  try {
    console.log(`Downloading AutoCAD file: ${fileId}`);
    
    // Haal download URL op voor het bestand
    const signedUrlResponse = await axios.get(`https://developer.api.autodesk.com/oss/v2/buckets/${fileId}/objects/${fileId}/signeds3download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const downloadUrl = signedUrlResponse.data.signedUrl;
    
    // Redirect naar de download URL
    res.redirect(downloadUrl);
  } catch (error) {
    console.error('Error downloading AutoCAD file:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Endpoint om AutoCAD bestand preview te bekijken
app.get('/autocad/files/:fileId/preview', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { fileId } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No access token provided' });
  if (!fileId) return res.status(400).json({ error: 'No file ID provided' });

  try {
    console.log(`Getting preview for AutoCAD file: ${fileId}`);
    
    // Haal preview URL op voor het bestand
    const previewResponse = await axios.get(`https://developer.api.autodesk.com/modelderivative/v2/designdata/${fileId}/thumbnail`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        width: 800,
        height: 600
      }
    });

    res.json({ previewUrl: previewResponse.data });
  } catch (error) {
    console.error('Error getting AutoCAD file preview:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get preview' });
  }
});

// --- Asta Powerproject OAuth ---
const ASTA_CLIENT_ID = process.env.ASTA_CLIENT_ID || 'your-asta-client-id';
const ASTA_CLIENT_SECRET = process.env.ASTA_CLIENT_SECRET || 'your-asta-client-secret';
const ASTA_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/asta/callback` : 'https://buildbridge-hub-api.loca.lt/asta/callback';
const ASTA_AUTH_URL = 'https://login.astapowerproject.com/oauth/authorize';
const ASTA_TOKEN_URL = 'https://login.astapowerproject.com/oauth/token';

app.get('/asta/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: ASTA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: ASTA_REDIRECT_URI,
    scope: 'read write',
    state: state
  });
  res.redirect(`${ASTA_AUTH_URL}?${params}`);
});

app.get('/asta/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    const tokenResponse = await axios.post(ASTA_TOKEN_URL, querystring.stringify({
      client_id: ASTA_CLIENT_ID,
      client_secret: ASTA_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: ASTA_REDIRECT_URI
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          asta_token: '${access_token}',
          asta_refresh_token: '${refresh_token}',
          asta_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Asta OAuth error:', error.response?.data || error.message);
    res.status(500).send('Asta OAuth authentication failed');
  }
});

app.get('/asta/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  console.log('Using mock data for Asta Powerproject projects (API permissions pending)');
  res.json({
    projects: [
      { id: 201, name: 'Wooncomplex Amstelveen - Planning', status: 'on-track', progress: 85 },
      { id: 202, name: 'Kantoorgebouw Rotterdam - Bouwplanning', status: 'delayed', progress: 55 },
      { id: 203, name: 'Renovatie School Utrecht - Planning', status: 'ahead', progress: 92 }
    ]
  });
});

app.get('/asta/files', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  console.log('Using mock data for Asta Powerproject files (API permissions pending)');
  res.json({
    files: [
      {
        id: 'asta-001',
        name: 'Wooncomplex_Planning.ast',
        type: 'AST',
        size: '3.2 MB',
        lastModified: '2024-02-14T09:15:00Z',
        status: 'active',
        project: 'Wooncomplex Amstelveen'
      },
      {
        id: 'asta-002',
        name: 'Resource_Planning.ast',
        type: 'AST',
        size: '1.8 MB',
        lastModified: '2024-02-13T16:30:00Z',
        status: 'active',
        project: 'Wooncomplex Amstelveen'
      },
      {
        id: 'asta-003',
        name: 'Kantoorgebouw_Planning.ast',
        type: 'AST',
        size: '2.1 MB',
        lastModified: '2024-02-12T11:45:00Z',
        status: 'active',
        project: 'Kantoorgebouw Rotterdam'
      },
      {
        id: 'asta-004',
        name: 'School_Renovatie_Planning.ast',
        type: 'AST',
        size: '1.5 MB',
        lastModified: '2024-02-11T14:20:00Z',
        status: 'active',
        project: 'Renovatie School Utrecht'
      }
    ]
  });
});

app.get('/asta/files/:fileId/download', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { fileId } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No access token provided' });
  if (!fileId) return res.status(400).json({ error: 'No file ID provided' });

  try {
    console.log(`Downloading Asta Powerproject file: ${fileId}`);
    
    // Mock download - in echte implementatie zou dit een echte API call zijn
    res.json({ 
      downloadUrl: `https://api.astapowerproject.com/files/${fileId}/download`,
      message: 'Download URL generated successfully'
    });
  } catch (error) {
    console.error('Error downloading Asta file:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

app.get('/asta/files/:fileId/preview', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { fileId } = req.params;
  
  if (!token) return res.status(401).json({ error: 'No access token provided' });
  if (!fileId) return res.status(400).json({ error: 'No file ID provided' });

  try {
    console.log(`Getting preview for Asta Powerproject file: ${fileId}`);
    
    // Mock preview - in echte implementatie zou dit een echte API call zijn
    res.json({ 
      previewUrl: `https://api.astapowerproject.com/files/${fileId}/preview`,
      message: 'Preview URL generated successfully'
    });
  } catch (error) {
    console.error('Error getting Asta file preview:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get preview' });
  }
});

// --- Revit OAuth (gebruikt dezelfde Autodesk Forge API als AutoCAD) ---
app.get('/revit/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: AUTODESK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/revit/callback` : 'https://buildbridge-hub-api.loca.lt/revit/callback',
    scope: AUTODESK_SCOPES,
    state: state
  });
  res.redirect(`${AUTODESK_AUTH_URL}?${params}`);
});

app.get('/revit/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    // Wissel authorization code om voor access token
    const tokenResponse = await axios.post(AUTODESK_TOKEN_URL, querystring.stringify({
      client_id: AUTODESK_CLIENT_ID,
      client_secret: AUTODESK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/revit/callback` : 'https://buildbridge-hub-api.loca.lt/revit/callback'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          revit_token: '${access_token}',
          revit_refresh_token: '${refresh_token}',
          revit_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Revit OAuth error:', error.response?.data || error.message);
    res.status(500).send('Revit OAuth authentication failed');
  }
});

app.get('/revit/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  // Tijdelijke oplossing: gebruik altijd mock data tot API permissions zijn opgelost
  console.log('Using mock data for Revit projects (API permissions pending)');
  res.json({
    projects: [
      { id: 201, name: 'Wooncomplex Amstelveen - BIM Model', status: 'on-track', progress: 75 },
      { id: 202, name: 'Kantoorgebouw Rotterdam - 3D Model', status: 'ahead', progress: 90 },
      { id: 203, name: 'Renovatie School Utrecht - BIM', status: 'delayed', progress: 45 }
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
      name: project.attributes.name || `Revit Project ${index + 1}`,
      status: 'on-track',
      progress: Math.floor(Math.random() * 100)
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Revit API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch projects from Revit API' });
  }
  */
});

// --- Solibri OAuth (gebruikt dezelfde Autodesk Forge API als AutoCAD/Revit) ---
app.get('/solibri/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: AUTODESK_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/solibri/callback` : 'https://buildbridge-hub-api.loca.lt/solibri/callback',
    scope: AUTODESK_SCOPES,
    state: state
  });
  res.redirect(`${AUTODESK_AUTH_URL}?${params}`);
});

app.get('/solibri/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    // Wissel authorization code om voor access token
    const tokenResponse = await axios.post(AUTODESK_TOKEN_URL, querystring.stringify({
      client_id: AUTODESK_CLIENT_ID,
      client_secret: AUTODESK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/solibri/callback` : 'https://buildbridge-hub-api.loca.lt/solibri/callback'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ 
          solibri_token: '${access_token}',
          solibri_refresh_token: '${refresh_token}',
          solibri_expires_in: ${expires_in}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Solibri OAuth error:', error.response?.data || error.message);
    res.status(500).send('Solibri OAuth authentication failed');
  }
});

app.get('/solibri/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  // Tijdelijke oplossing: gebruik altijd mock data tot API permissions zijn opgelost
  console.log('Using mock data for Solibri projects (API permissions pending)');
  res.json({
    projects: [
      { id: 301, name: 'Wooncomplex Amstelveen - BIM Check', status: 'on-track', progress: 85 },
      { id: 302, name: 'Kantoorgebouw Rotterdam - Model Validation', status: 'ahead', progress: 95 },
      { id: 303, name: 'Renovatie School Utrecht - Quality Check', status: 'delayed', progress: 60 }
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
      name: project.attributes.name || `Solibri Project ${index + 1}`,
      status: 'on-track',
      progress: Math.floor(Math.random() * 100)
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Solibri API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch projects from Solibri API' });
  }
  */
});

// --- Excel OAuth (via Microsoft Graph API) ---
const EXCEL_TOKEN = 'mock-excel-token';

app.get('/excel/auth', (req, res) => {
  // Gebruik dezelfde Microsoft OAuth flow als MS Project
  const state = Math.random().toString(36).substring(7);
  const params = querystring.stringify({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/excel/callback` : 'https://buildbridge-hub-api.loca.lt/excel/callback',
    response_mode: 'query',
    scope: MS_SCOPES,
    state: state,
    prompt: 'select_account' // Forceert account selectie
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
      redirect_uri: process.env.NGROK_URL ? `${process.env.NGROK_URL}/excel/callback` : 'https://buildbridge-hub-api.loca.lt/excel/callback',
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
const WHATSAPP_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/whatsapp/callback` : 'https://buildbridge-hub-api.loca.lt/whatsapp/callback';
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

// --- Bluebeam Revu OAuth (PDF Analysis) ---
const BLUEBEAM_CLIENT_ID = process.env.BLUEBEAM_CLIENT_ID || 'your-bluebeam-client-id';
const BLUEBEAM_CLIENT_SECRET = process.env.BLUEBEAM_CLIENT_SECRET || 'your-bluebeam-client-secret';
const BLUEBEAM_REDIRECT_URI = process.env.NGROK_URL ? `${process.env.NGROK_URL}/bluebeam/callback` : 'https://buildbridge-hub-api.loca.lt/bluebeam/callback';
const BLUEBEAM_AUTH_URL = 'https://api.bluebeam.com/oauth/authorize';
const BLUEBEAM_TOKEN_URL = 'https://api.bluebeam.com/oauth/token';

app.get('/bluebeam/auth', (req, res) => {
  // Voor development: gebruik mock OAuth flow
  const state = Math.random().toString(36).substring(7);
  
  // Simuleer OAuth redirect naar mock Bluebeam pagina
  const mockAuthUrl = `${BLUEBEAM_REDIRECT_URI}?code=mock_bluebeam_code_${Date.now()}&state=${state}`;
  
  console.log('Bluebeam OAuth initiated, redirecting to:', mockAuthUrl);
  res.redirect(mockAuthUrl);
});

app.get('/bluebeam/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code received');

  try {
    console.log('Bluebeam callback received:', { code, state });
    
    // Voor development: genereer mock tokens
    const mockAccessToken = `mock_bluebeam_token_${Date.now()}`;
    const mockRefreshToken = `mock_bluebeam_refresh_${Date.now()}`;
    const expiresIn = 3600; // 1 uur
    
    console.log('Generated mock Bluebeam tokens:', { mockAccessToken, mockRefreshToken });
    
    res.send(`
      <script>
        console.log('Bluebeam OAuth callback successful');
        window.opener && window.opener.postMessage({ 
          bluebeam_token: '${mockAccessToken}',
          bluebeam_refresh_token: '${mockRefreshToken}',
          bluebeam_expires_in: ${expiresIn}
        }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error('Bluebeam OAuth error:', error);
    res.status(500).send(`
      <script>
        console.error('Bluebeam OAuth failed:', '${error.message}');
        window.opener && window.opener.postMessage({ 
          error: 'Bluebeam OAuth authentication failed'
        }, '*');
        window.close();
      </script>
    `);
  }
});

// Get Bluebeam projects (PDF documents)
app.get('/bluebeam/projects', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Mock data voor Bluebeam projects (PDF documents)
    const projects = [
      {
        id: 'project-001',
        name: 'Bouwtekening Hoofdgebouw',
        status: 'reviewed',
        progress: 85,
        type: 'pdf',
        lastModified: '2024-01-15T10:30:00Z',
        size: '2.5 MB',
        pages: 24
      },
      {
        id: 'project-002',
        name: 'Elektrische Installatie',
        status: 'in-progress',
        progress: 45,
        type: 'pdf',
        lastModified: '2024-01-14T14:20:00Z',
        size: '1.8 MB',
        pages: 18
      },
      {
        id: 'project-003',
        name: 'HVAC Systeem',
        status: 'pending',
        progress: 20,
        type: 'pdf',
        lastModified: '2024-01-13T09:15:00Z',
        size: '3.2 MB',
        pages: 32
      }
    ];

    res.json({ projects });
  } catch (error) {
    console.error('Bluebeam API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Bluebeam projects' });
  }
});

// Get Bluebeam files (PDF documents with metadata)
app.get('/bluebeam/files', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Mock data voor Bluebeam files
    const files = [
      {
        id: 'file-001',
        name: 'Bouwtekening_Hoofdgebouw.pdf',
        tool: 'Bluebeam Revu',
        size: '2.5 MB',
        type: 'pdf',
        lastModified: '2024-01-15T10:30:00Z',
        pages: 24,
        annotations: 156,
        markups: 89,
        status: 'reviewed',
        projectId: 'project-001'
      },
      {
        id: 'file-002',
        name: 'Elektrische_Installatie.pdf',
        tool: 'Bluebeam Revu',
        size: '1.8 MB',
        type: 'pdf',
        lastModified: '2024-01-14T14:20:00Z',
        pages: 18,
        annotations: 94,
        markups: 67,
        status: 'in-progress',
        projectId: 'project-002'
      },
      {
        id: 'file-003',
        name: 'HVAC_Systeem.pdf',
        tool: 'Bluebeam Revu',
        size: '3.2 MB',
        type: 'pdf',
        lastModified: '2024-01-13T09:15:00Z',
        pages: 32,
        annotations: 203,
        markups: 124,
        status: 'pending',
        projectId: 'project-003'
      }
    ];

    res.json({ files });
  } catch (error) {
    console.error('Bluebeam files API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Bluebeam files' });
  }
});

// Download Bluebeam PDF file
app.get('/bluebeam/files/:fileId/download', async (req, res) => {
  const { fileId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Mock download URL (in real implementation, this would generate a signed URL)
    const downloadUrl = `https://api.bluebeam.com/files/${fileId}/download?token=${token}`;
    
    res.json({ 
      downloadUrl,
      message: 'PDF file ready for download',
      fileId,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    console.error('Bluebeam download error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// Analyze Bluebeam PDF (extract annotations, markups, etc.)
app.get('/bluebeam/files/:fileId/analyze', async (req, res) => {
  const { fileId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Mock PDF analysis data
    const analysis = {
      fileId,
      fileName: `File_${fileId}.pdf`,
      analysisDate: new Date().toISOString(),
      summary: {
        totalPages: 24,
        totalAnnotations: 156,
        totalMarkups: 89,
        reviewStatus: 'completed',
        approvalStatus: 'approved'
      },
      annotations: {
        highlights: 45,
        comments: 67,
        measurements: 23,
        stamps: 21
      },
      markups: {
        text: 34,
        shapes: 28,
        images: 12,
        links: 15
      },
      metadata: {
        author: 'John Doe',
        createdDate: '2024-01-10T08:00:00Z',
        modifiedDate: '2024-01-15T10:30:00Z',
        version: '1.2',
        security: 'password-protected'
      },
      extractedText: {
        pages: [
          {
            pageNumber: 1,
            text: 'Bouwtekening Hoofdgebouw - Project XYZ...',
            wordCount: 245
          },
          {
            pageNumber: 2,
            text: 'Technische specificaties en materialen...',
            wordCount: 189
          }
        ]
      }
    };

    res.json(analysis);
  } catch (error) {
    console.error('Bluebeam analysis error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze PDF' });
  }
});

// Get PDF annotations and markups
app.get('/bluebeam/files/:fileId/annotations', async (req, res) => {
  const { fileId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No access token provided' });

  try {
    // Mock annotations data
    const annotations = [
      {
        id: 'ann-001',
        type: 'highlight',
        page: 1,
        content: 'Belangrijke wijziging in fundering',
        author: 'John Doe',
        date: '2024-01-15T10:30:00Z',
        coordinates: { x: 150, y: 200, width: 100, height: 20 }
      },
      {
        id: 'ann-002',
        type: 'comment',
        page: 3,
        content: 'Controleer deze afmetingen',
        author: 'Jane Smith',
        date: '2024-01-14T14:20:00Z',
        coordinates: { x: 300, y: 450, width: 80, height: 15 }
      },
      {
        id: 'ann-003',
        type: 'measurement',
        page: 5,
        content: 'Lengte: 12.5m',
        author: 'Mike Johnson',
        date: '2024-01-13T09:15:00Z',
        coordinates: { x: 200, y: 300, width: 120, height: 10 }
      }
    ];

    res.json({ annotations });
  } catch (error) {
    console.error('Bluebeam annotations error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// --- N8N Webhook Callback Endpoint ---
app.post('/n8n/webhook', (req, res) => {
  console.log('N8N Webhook received:', req.body);
  
  // Verwerk de webhook data
  const { event, data, source } = req.body;
  
  // Stuur bevestiging terug naar N8N
  res.json({
    success: true,
    message: 'Webhook received successfully',
    timestamp: new Date().toISOString(),
    event: event,
    data: data
  });
});

// --- N8N OAuth Callback Endpoint ---
app.get('/n8n/callback', (req, res) => {
  const { code, state, tool } = req.query;
  
  console.log('N8N OAuth callback received:', { code, state, tool });
  
  if (!code) {
    return res.status(400).json({ 
      error: 'No authorization code received',
      message: 'OAuth callback failed - missing authorization code'
    });
  }

  // Stuur de OAuth data terug naar N8N
  res.json({
    success: true,
    message: 'OAuth callback successful',
    data: {
      code: code,
      state: state,
      tool: tool,
      timestamp: new Date().toISOString()
    }
  });
});

// --- N8N Data Endpoint ---
app.get('/n8n/data/:tool', async (req, res) => {
  const { tool } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    let data;
    
    switch(tool) {
      case 'autocad':
        // Haal AutoCAD data op
        data = {
          projects: [
            { id: 'ac-001', name: 'AutoCAD Project 1', status: 'active' },
            { id: 'ac-002', name: 'AutoCAD Project 2', status: 'completed' }
          ],
          files: [
            { id: 'file-001', name: 'drawing.dwg', size: '2.5 MB' },
            { id: 'file-002', name: 'design.dxf', size: '1.8 MB' }
          ]
        };
        break;
        
      case 'bluebeam':
        // Haal Bluebeam data op
        data = {
          projects: [
            { id: 'bb-001', name: 'PDF Review Project', status: 'in-progress' },
            { id: 'bb-002', name: 'Document Analysis', status: 'pending' }
          ],
          files: [
            { id: 'pdf-001', name: 'review.pdf', pages: 24, annotations: 156 },
            { id: 'pdf-002', name: 'analysis.pdf', pages: 18, annotations: 94 }
          ]
        };
        break;
        
      case 'msproject':
        // Haal MS Project data op
        data = {
          projects: [
            { id: 'ms-001', name: 'Project Planning', status: 'on-track' },
            { id: 'ms-002', name: 'Timeline Management', status: 'delayed' }
          ],
          tasks: [
            { id: 'task-001', name: 'Task 1', progress: 75 },
            { id: 'task-002', name: 'Task 2', progress: 45 }
          ]
        };
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported tool' });
    }
    
    res.json({
      success: true,
      tool: tool,
      data: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`Error fetching ${tool} data:`, error);
    res.status(500).json({ 
      error: `Failed to fetch ${tool} data`,
      message: error.message 
    });
  }
});

// --- N8N Status Endpoint ---
app.get('/n8n/status', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/n8n/webhook',
      callback: '/n8n/callback',
      data: '/n8n/data/:tool',
      status: '/n8n/status'
    },
    available_tools: [
      'autocad',
      'bluebeam', 
      'msproject',
      'asta',
      'revit',
      'solibri',
      'excel',
      'whatsapp'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 