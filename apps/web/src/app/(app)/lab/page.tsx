import { DemoLab } from "@/components/experience/demo-lab";
import { createClient } from "@/lib/supabase/server";
import { LabClient } from "./lab-client";

/**
 * Authenticated users see the real lab. Guests see the demo lab.
 */
export default async function LabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <DemoLab />;
  }

  return <LabClient />;
}
