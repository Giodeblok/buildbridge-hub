-- Supabase Database Migration Script
-- Voer dit uit in je Supabase SQL Editor

-- 1. User Tools tabel (voor gekoppelde tools per gebruiker)
CREATE TABLE IF NOT EXISTS user_tools (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. OAuth Tokens tabel (voor veilige token opslag)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_in INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- 3. Project Data tabel (voor opgeslagen project informatie)
CREATE TABLE IF NOT EXISTS project_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_status TEXT DEFAULT 'on-track',
  project_progress INTEGER DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id, project_id)
);

-- 4. Integration Status tabel (voor koppeling status)
CREATE TABLE IF NOT EXISTS integration_status (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- 5. Row Level Security (RLS) inschakelen
ALTER TABLE user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_status ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies voor user_tools
CREATE POLICY "Users can view own tools" ON user_tools
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tools" ON user_tools
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tools" ON user_tools
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tools" ON user_tools
  FOR DELETE USING (auth.uid() = user_id);

-- 7. RLS Policies voor oauth_tokens
CREATE POLICY "Users can view own tokens" ON oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- 8. RLS Policies voor project_data
CREATE POLICY "Users can view own project data" ON project_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project data" ON project_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project data" ON project_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project data" ON project_data
  FOR DELETE USING (auth.uid() = user_id);

-- 9. RLS Policies voor integration_status
CREATE POLICY "Users can view own integration status" ON integration_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integration status" ON integration_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integration status" ON integration_status
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integration status" ON integration_status
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Indexes voor betere performance
CREATE INDEX idx_user_tools_user_id ON user_tools(user_id);
CREATE INDEX idx_user_tools_tool_id ON user_tools(tool_id);
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_tool_id ON oauth_tokens(tool_id);
CREATE INDEX idx_project_data_user_id ON project_data(user_id);
CREATE INDEX idx_project_data_tool_id ON project_data(tool_id);
CREATE INDEX idx_integration_status_user_id ON integration_status(user_id);
CREATE INDEX idx_integration_status_tool_id ON integration_status(tool_id);

-- 11. Functions voor automatische updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Triggers voor automatische updated_at
CREATE TRIGGER update_user_tools_updated_at BEFORE UPDATE ON user_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_data_updated_at BEFORE UPDATE ON project_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_status_updated_at BEFORE UPDATE ON integration_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Real-time inschakelen voor alle tabellen
ALTER PUBLICATION supabase_realtime ADD TABLE user_tools;
ALTER PUBLICATION supabase_realtime ADD TABLE oauth_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE project_data;
ALTER PUBLICATION supabase_realtime ADD TABLE integration_status; 

-- Voeg deze SQL toe aan je Supabase SQL editor

-- Maak storage bucket aan voor project bestanden
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies voor project-files bucket
-- Alleen ingelogde gebruikers kunnen bestanden uploaden
CREATE POLICY "Users can upload project files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' AND 
  auth.role() = 'authenticated'
);

-- Alleen ingelogde gebruikers kunnen bestanden bekijken
CREATE POLICY "Users can view project files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-files' AND 
  auth.role() = 'authenticated'
);

-- Alleen ingelogde gebruikers kunnen bestanden verwijderen
CREATE POLICY "Users can delete project files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' AND 
  auth.role() = 'authenticated'
);

-- Alleen ingelogde gebruikers kunnen bestanden updaten
CREATE POLICY "Users can update project files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-files' AND 
  auth.role() = 'authenticated'
); 