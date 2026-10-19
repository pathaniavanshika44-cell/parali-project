import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project details
const supabaseUrl = "https://gpcsjdyhvtofysxdpomo.supabase.co";  // ✅ Must start with https://
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwY3NqZHlodnRvZnlzeGRwb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjY5ODgsImV4cCI6MjA4ODc0Mjk4OH0.8kOg3fLTkU10QjqmLobsYOsdpeL3BkIwlN1hB17rUxk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);