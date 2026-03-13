import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom fetch to completely bypass local clock skew issues (PC is 2026, token is 2024).
// Supabase-js refuses to send "expired" tokens, but the server will accept them because its clock is right.
const customFetch = async (url, options = {}) => {
  const forcedToken = localStorage.getItem('minelab-forced-token');
  if (forcedToken) {
    let newHeaders = {};
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        newHeaders[key.toLowerCase()] = value;
      });
    } else if (options.headers) {
      for (const key in options.headers) {
        newHeaders[key.toLowerCase()] = options.headers[key];
      }
    }
    
    newHeaders['authorization'] = `Bearer ${forcedToken}`;
    newHeaders['apikey'] = supabaseKey;
    
    options.headers = newHeaders;
  }
  return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // We still want it to try, but our forced token rules
  },
  global: {
    fetch: customFetch
  }
});
