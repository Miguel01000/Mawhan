// Js/Supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://mkogtzpghiwgildbfdog.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2d0enBnaGl3Z2lsZGJmZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzU2MTAsImV4cCI6MjA1NjAxMTYxMH0.n14m088aNPQyVC5ynWT3PyCK5PBhnhuFH00pG8NNL18";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export { supabase };
