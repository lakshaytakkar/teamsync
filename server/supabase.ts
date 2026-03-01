import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — store lookups will fail");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export async function getStoreCredentials(storeId: string): Promise<{
  app_credentials: string;
  oauth_access_token: string;
} | null> {
  const { data, error } = await supabase.rpc("faire_get_store_credentials", {
    p_store_id: storeId,
  });

  if (error) {
    console.error("[supabase] getStoreCredentials error:", error.message);
    return null;
  }

  const rows = data as { app_credentials: string; oauth_access_token: string }[] | null;
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export async function listStores(): Promise<{ id: string; name: string; active: boolean }[]> {
  const { data, error } = await supabase.rpc("faire_list_stores");

  if (error) {
    console.error("[supabase] listStores error:", error.message);
    return [];
  }

  return (data as { id: string; name: string; active: boolean }[]) ?? [];
}
