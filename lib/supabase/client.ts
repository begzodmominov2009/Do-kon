import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Set it in .env.local before using Supabase.`,
    );
  }
  return value;
}

let cachedClient: SupabaseClient<Database> | undefined;

// Browser-safe client: public anon key only, gated by RLS. Read-only use —
// never perform writes through this client. Created lazily (and cached) on
// first call so a missing env var fails when the client is actually used,
// not at module load / build time.
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!cachedClient) {
    cachedClient = createClient<Database>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  }
  return cachedClient;
}
