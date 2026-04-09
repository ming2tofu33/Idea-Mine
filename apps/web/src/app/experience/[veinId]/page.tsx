import { redirect } from "next/navigation";

/**
 * /experience/[veinId]는 더 이상 사용하지 않음.
 * 게스트도 /mine에서 데모를 볼 수 있으므로 /mine으로 통합 redirect.
 */
export default async function ExperienceVeinRedirect({
  params,
}: {
  params: Promise<{ veinId: string }>;
}) {
  const { veinId } = await params;
  redirect(`/mine?veinId=${veinId}`);
}
