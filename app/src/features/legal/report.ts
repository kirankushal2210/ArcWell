// Report a coach profile (D-05, D111): an email to the support inbox with the coach named, until there's
// an in-app queue. Nothing is sent by the app itself; the person's own mail app opens.
import { OPERATOR } from "./docs";

export const REPORT_SUBJECT = "Report a coach profile";

/** The mailto link for reporting a coach. The coach's display name is public (D43). */
export function reportCoachLink(coachName: string) {
  const name = coachName.trim().slice(0, 80);
  const subject = name ? `${REPORT_SUBJECT}: ${name}` : REPORT_SUBJECT;
  const body =
    "Tell us what's wrong with this profile (for example: false claims, someone else's photos, unsafe advice).\n\n";
  return `mailto:${OPERATOR.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
