import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Browser-safe client: public anon key only, gated by RLS. Read-only use —
// never perform writes through this client.
export const supabaseBrowserClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
