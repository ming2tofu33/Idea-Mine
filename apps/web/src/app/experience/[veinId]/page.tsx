import { notFound } from "next/navigation";
import { ExperienceResult } from "@/components/experience/experience-result";
import {
  getExperienceIdeasByVeinId,
  getExperienceVeinById,
} from "@/lib/experience-data";

type PageProps = {
  params: Promise<{ veinId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { veinId } = await params;
  const vein = getExperienceVeinById(veinId);
  if (!vein) return { title: "Experience — IDEA MINE" };
  return {
    title: `${vein.previewLineKo} — IDEA MINE`,
    description: `${vein.previewLineKo}에 대한 샘플 아이디어 3개를 미리보기로 확인하세요.`,
  };
}

export default async function ExperienceResultPage({ params }: PageProps) {
  const { veinId } = await params;
  const vein = getExperienceVeinById(veinId);

  if (!vein) {
    notFound();
  }

  const ideas = getExperienceIdeasByVeinId(vein.id);

  return <ExperienceResult vein={vein} ideas={ideas} />;
}
