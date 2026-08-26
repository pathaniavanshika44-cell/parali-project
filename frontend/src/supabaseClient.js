// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://gpcsjdyhvtofysxdpomo.supabase.co";
// const supabaseAnonKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwY3NqZHlodnRvZnlzeGRwb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjY5ODgsImV4cCI6MjA4ODc0Mjk4OH0.8kOg3fLTkU10QjqmLobsYOsdpeL3BkIwlN1hB17rUxk";

// // Create Supabase client
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     persistSession: true,      // Keeps session across page reloads
//     detectSessionInUrl: true,  // Detects OAuth redirects
//     autoRefreshToken: true,    // Auto refresh JWT before expiry
//   },
// });



import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
});