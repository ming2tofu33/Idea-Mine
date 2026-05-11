import { createClient } from "@/lib/supabase/server";
import { VaultClient } from "./vault-client";

/**
 * Authenticated users see the real vault. Guests see the demo vault.
 */
export default async function VaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <VaultClient mockMode />;
  }

  return <VaultClient />;
}
