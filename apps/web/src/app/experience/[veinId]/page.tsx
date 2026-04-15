import { redirect } from "next/navigation";

/**
 * Legacy detail route preserved for compatibility. Redirects to /mine.
 */
export default async function ExperienceVeinRedirect({
  params,
}: {
  params: Promise<{ veinId: string }>;
}) {
  const { veinId } = await params;
  redirect(`/mine?veinId=${veinId}`);
}
