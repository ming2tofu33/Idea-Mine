import { redirect } from "next/navigation";

/**
 * Legacy route preserved for compatibility. Redirects to /mine.
 */
export default function ExperienceRedirect() {
  redirect("/mine");
}
