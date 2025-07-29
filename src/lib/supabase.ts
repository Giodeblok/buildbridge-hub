import { createClient } from '@supabase/supabase-js'

// Fallback waarden als environment variables niet worden geladen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtxvbebfhikvlyfonwdj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHZiZWJmaGlrdmx5Zm9ud2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NzM2MzMsImV4cCI6MjA2OTM0OTYzM30.aFCy0mMfdNRLJNxMykrrHck6rQ_AdhG00WKJCgxepKU'

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in environment variables')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 