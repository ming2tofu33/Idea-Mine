import { createClient } from "@/lib/supabase/server";
import { DemoMine } from "@/components/experience/demo-mine";
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
    return <DemoMine />;
  }

  return <MineClient />;
}
