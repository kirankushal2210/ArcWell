// "Report this profile" (D-05): opens the person's mail app addressed to support. If no mail app can
// open, the address is shown instead so they can write from anywhere.
import { Linking } from "react-native";

import { Button } from "@/components/primitives";
import { alert } from "@/lib/alert";

import { OPERATOR } from "./docs";
import { reportCoachLink } from "./report";

export function reportCoach(coachName: string) {
  Linking.openURL(reportCoachLink(coachName)).catch(() =>
    alert(
      "Report this profile",
      `Email ${OPERATOR.supportEmail} and tell us which coach and what's wrong.`,
    ),
  );
}

export function ReportCoachButton({ coachName }: { coachName: string }) {
  return (
    <Button
      label="Report this profile"
      variant="ghost"
      onPress={() => reportCoach(coachName)}
    />
  );
}
