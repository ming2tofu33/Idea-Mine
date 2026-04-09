import { ExperienceEntry } from "@/components/experience/experience-entry";
import { getExperienceVeins } from "@/lib/experience-data";

export const metadata = {
  title: "Experience — IDEA MINE",
  description: "로그인 없이 오늘의 AI 아이디어 광맥을 미리 체험해보세요.",
};

export default function ExperiencePage() {
  const veins = getExperienceVeins();
  return <ExperienceEntry veins={veins} />;
}
