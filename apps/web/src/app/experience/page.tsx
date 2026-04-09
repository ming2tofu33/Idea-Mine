import { redirect } from "next/navigation";

/**
 * /experience는 /mine으로 통합됨.
 * 게스트도 /mine에서 데모 모드를 볼 수 있도록 변경.
 * 이 라우트는 호환성을 위해 redirect만 수행.
 */
export default function ExperienceRedirect() {
  redirect("/mine");
}
