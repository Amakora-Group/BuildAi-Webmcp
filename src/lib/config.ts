export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
export const WORKSPACE_LABEL = import.meta.env.VITE_WORKSPACE_LABEL ?? "";

export function getMissingConfig(): string[] {
  const missing: string[] = [];
  if (!API_BASE_URL) missing.push("VITE_API_BASE_URL");
  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  return missing;
}

export function isConfigValid() {
  return getMissingConfig().length === 0;
}

export function getConfigErrorMessage() {
  const missing = getMissingConfig();
  if (missing.length === 0) return null;
  return `Missing environment variables: ${missing.join(", ")}. Create webmcp-demo/.env.local and restart the dev server.`;
}
