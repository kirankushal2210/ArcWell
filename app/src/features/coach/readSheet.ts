// Picks a spreadsheet and reads it into a draft program (D55, CO-10). The file stays on the phone:
// it is read here and never uploaded.
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Platform } from "react-native";

import {
  importRows,
  READ_ERROR,
  rowsFromFile,
  type SheetImport,
} from "./importSheet";

export const SHEET_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls (asked to save as .xlsx)
  "text/csv",
  "text/comma-separated-values",
  "text/tab-separated-values",
];

export type PickedSheet = {
  name: string;
  size?: number;
  /** Set when the file was read. */
  draft?: SheetImport;
  /** Set when it couldn't be. */
  error?: string;
};

async function bytesOf(uri: string) {
  if (Platform.OS === "web")
    return new Uint8Array(await (await fetch(uri)).arrayBuffer());
  return new File(uri).bytes();
}

/** Opens the file picker and reads the chosen sheet; null when the coach cancels. */
export async function pickSheet(): Promise<PickedSheet | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: SHEET_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  }).catch(() => null);
  const asset = res && !res.canceled ? res.assets[0] : undefined;
  if (!asset) return null;
  const picked = { name: asset.name, size: asset.size };
  if (/\.xls$/i.test(asset.name))
    return {
      ...picked,
      error: "Old .xls files can't be read. Save it as .xlsx or .csv.",
    };
  try {
    const bytes = await bytesOf(asset.uri);
    const draft = importRows(
      rowsFromFile(bytes, asset.name, asset.mimeType ?? undefined),
      asset.name,
    );
    if (!draft.program.days.length)
      return {
        ...picked,
        error:
          "No exercises found. Use one row per exercise: day, exercise, sets, reps.",
      };
    return { ...picked, draft };
  } catch {
    return { ...picked, error: READ_ERROR };
  }
}

/** The draft waiting for review, handed from onboarding or Plans to the import screen. */
let pending: SheetImport | null = null;
export const setPendingImport = (d: SheetImport | null) => {
  pending = d;
};
export const pendingImport = () => pending;
