import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Server-only client: uses the service_role key, which bypasses RLS. The
// "server-only" import above makes any accidental client-component import
// of this file fail at build time instead of leaking the key to the browser.
export const supabaseServerClient = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  { auth: { persistSession: false } },
);
