import { createClient } from "@/lib/supabase/server";
import { MineClient } from "./mine-client";

/**
 * Authenticated users see live mining. Guests see the demo mining flow.
 */
export default async function MinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <MineClient mockMode />;
  }

  return <MineClient />;
}
