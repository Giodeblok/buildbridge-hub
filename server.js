import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'dev_secret';
const MOCK_USER = { email: 'test@demo.nl', password: 'test123', id: 1, name: 'Demo User' };

// Mock config, vervang door echte waarden uit Azure Portal voor productie
const default_client_id = 'mock-client-id';
const default_client_secret = 'mock-client-secret';
const default_redirect_uri = 'http://localhost:4000/msproject/callback';
const MS_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MS_SCOPES = 'offline_access user.read Tasks.Read Project.Read.All';

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

app.get('/msproject/auth', (req, res) => {
  const params = querystring.stringify({
    client_id: default_client_id,
    response_type: 'code',
    redirect_uri: default_redirect_uri,
    response_mode: 'query',
    scope: MS_SCOPES,
    state: '12345' // in productie: random/generate
  });
  res.redirect(`${MS_AUTH_URL}?${params}`);
});

app.get('/msproject/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code');
  // In productie: wissel code om voor access_token bij Microsoft
  // Hier: mock response
  // Voorbeeld echte call:
  // const tokenRes = await axios.post(MS_TOKEN_URL, querystring.stringify({
  //   client_id: default_client_id,
  //   client_secret: default_client_secret,
  //   code,
  //   redirect_uri: default_redirect_uri,
  //   grant_type: 'authorization_code'
  // }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  // const { access_token, refresh_token } = tokenRes.data;
  // res.json({ access_token, refresh_token });
  res.send(`<script>window.opener && window.opener.postMessage({ msproject_token: 'mock-access-token' }, '*'); window.close();</script>`);
});

app.get('/msproject/projects', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== 'mock-access-token') {
    return res.status(401).json({ error: 'No valid MS Project token' });
  }
  res.json({
    projects: [
      { id: 1, name: 'Nieuwbouw School Utrecht', status: 'on-track', progress: 80 },
      { id: 2, name: 'Renovatie Kantoor Rotterdam', status: 'delayed', progress: 45 },
      { id: 3, name: 'Wooncomplex Amstelveen', status: 'ahead', progress: 95 }
    ]
  });
});

// In-memory store voor gekoppelde tools per user
const userTools = {};

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

// --- AutoCAD OAuth mock ---
const AUTOCAD_TOKEN = 'mock-autocad-token';

app.get('/autocad/auth', (req, res) => {
  // In productie: redirect naar echte AutoCAD OAuth
  res.redirect('/autocad/callback?code=mockcode');
});

app.get('/autocad/callback', (req, res) => {
  // In productie: wissel code om voor token
  res.send(`<script>window.opener && window.opener.postMessage({ autocad_token: '${AUTOCAD_TOKEN}' }, '*'); window.close();</script>`);
});

app.get('/autocad/projects', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== AUTOCAD_TOKEN) {
    return res.status(401).json({ error: 'No valid AutoCAD token' });
  }
  res.json({
    projects: [
      { id: 101, name: 'AutoCAD Project A', status: 'on-track', progress: 60 },
      { id: 102, name: 'AutoCAD Project B', status: 'delayed', progress: 30 }
    ]
  });
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

app.listen(4000, () => {
  console.log('Auth server running on http://localhost:4000');
}); 