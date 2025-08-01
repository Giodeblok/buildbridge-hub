// API base URL configuratie
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: gebruik window.location of environment variable
    return process.env.NODE_ENV === 'production' 
      ? 'https://buildbridge-hub-production.up.railway.app' 
      : 'http://localhost:4000';
  }
  // Server-side: gebruik environment variable
  return process.env.NODE_ENV === 'production' 
    ? 'https://buildbridge-hub-production.up.railway.app' 
    : 'http://localhost:4000';
};

// Helper functie voor API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}; 