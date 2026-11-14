// Picking a spreadsheet (D55, CO-10): read on the phone, never uploaded. Cancel gives nothing; old
// .xls, empty and unreadable mockFiles give a plain sentence; a good file gives a draft program.
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { strToU8 } from "fflate";

import { READ_ERROR } from "@/features/coach/importSheet";
import {
  pendingImport,
  pickSheet,
  setPendingImport,
} from "@/features/coach/readSheet";

type Pick = {
  canceled: boolean;
  assets: { name: string; uri: string; size?: number; mimeType?: string }[];
};
const mockPicker = { result: null as Pick | null, fail: false };
const mockFiles = new Map<string, Uint8Array>();

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: () =>
    mockPicker.fail
      ? Promise.reject(new Error("mockPicker"))
      : Promise.resolve(mockPicker.result),
}));
jest.mock("expo-file-system", () => ({
  File: class {
    mockUri: string;
    constructor(mockUri: string) {
      this.mockUri = mockUri;
    }
    bytes() {
      return Promise.resolve(mockFiles.get(this.mockUri) ?? new Uint8Array());
    }
  },
}));

const choose = (
  name: string,
  content: string | Uint8Array,
  mimeType?: string,
) => {
  const uri = `file:///cache/${name}`;
  mockFiles.set(uri, typeof content === "string" ? strToU8(content) : content);
  mockPicker.result = {
    canceled: false,
    assets: [{ name, uri, size: 100, mimeType }],
  };
};

beforeEach(() => {
  mockPicker.result = null;
  mockPicker.fail = false;
  mockFiles.clear();
});

describe("pickSheet", () => {
  it("returns nothing when the coach cancels or the mockPicker fails", async () => {
    mockPicker.result = { canceled: true, assets: [] };
    expect(await pickSheet()).toBeNull();
    mockPicker.fail = true;
    expect(await pickSheet()).toBeNull();
  });

  it("reads a CSV into a draft program", async () => {
    choose(
      "program.csv",
      "Day,Exercise,Sets,Reps\nPush,Barbell bench press,4,6-8\nPull,Lat pulldown,3,10\n",
      "text/csv",
    );
    const r = await pickSheet();
    expect(r?.name).toBe("program.csv");
    expect(r?.error).toBeUndefined();
    expect(r?.draft?.program.days.map((d) => d.name)).toEqual(["Push", "Pull"]);
  });

  it("asks for .xlsx or .csv instead of an old .xls", async () => {
    choose("old.xls", "anything");
    expect((await pickSheet())?.error).toMatch(/Save it as \.xlsx or \.csv/);
  });

  it("explains the layout when no exercises are found", async () => {
    choose("empty.csv", "Day,Exercise,Sets,Reps\n", "text/csv");
    expect((await pickSheet())?.error).toMatch(/one row per exercise/);
  });

  it("gives the read error for a damaged file", async () => {
    choose("broken.xlsx", new Uint8Array([1, 2, 3, 4]));
    expect((await pickSheet())?.error).toBe(READ_ERROR);
  });
});

describe("pending import", () => {
  it("hands one draft to the review screen, then clears", async () => {
    choose("p.csv", "Day,Exercise,Sets,Reps\nA,Squat,3,5\n", "text/csv");
    const draft = (await pickSheet())!.draft!;
    setPendingImport(draft);
    expect(pendingImport()).toBe(draft);
    setPendingImport(null);
    expect(pendingImport()).toBeNull();
  });
});
