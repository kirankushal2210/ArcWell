// Export and delete for signed-in accounts (B6, X-09, Google Play's account deletion rule). Sample
// builds keep the sample behaviour; with accounts these go to the server.
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { isoToday } from "@/features/athlete/athleteData";
import { useAuth } from "@/features/auth/AuthProvider";
import { alert } from "@/lib/alert";

import { deleteMyAccount, exportMyData } from "./repo";

/** Hand the export to the person: a download on the web, the share sheet on a phone. */
async function saveJson(data: unknown) {
  const text = JSON.stringify(data, null, 2);
  const name = `arcwell-export-${isoToday()}.json`;
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, name);
  file.write(text);
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: name,
    });
}

export function useAccountActions() {
  const auth = useAuth();
  const live = auth.enabled && !!auth.session;
  return {
    /** True when export and delete reach the server. */
    live,
    /** Everything the server holds about you, as a JSON file. Resolves false on failure. */
    exportNow: async () => {
      const r = await exportMyData();
      if (r.error || !r.data) {
        alert("Export didn't work", r.error ?? "Try again in a moment.");
        return false;
      }
      await saveJson(r.data);
      return true;
    },
    /** Deletes the account on the server, then signs out. Resolves false on failure. */
    deleteNow: async () => {
      const r = await deleteMyAccount();
      if (r.error) {
        alert("Couldn't delete your account", r.error);
        return false;
      }
      await auth.signOut();
      return true;
    },
  };
}
