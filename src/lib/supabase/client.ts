import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Check if real keys are provided or if placeholder
  const isConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("placeholder-project") &&
    !supabaseAnonKey.includes("placeholder-anon-key");

  if (!isConfigured) {
    // Return a safe mock/stub client if credentials are not configured yet
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
