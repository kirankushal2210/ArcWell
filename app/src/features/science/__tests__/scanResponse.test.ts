// The app checks the scan-meal answer's shape before using it (D96).
import { describe, expect, it } from "@jest/globals";

import { parseScanResponse } from "@/features/ai/scanResponse";

const food = {
  name: "Dal tadka",
  grams: 150,
  kcal: 165,
  protein: 9,
  carbs: 21,
  fat: 5,
  confidence: "high",
};

describe("scan response", () => {
  it("accepts foods and not-food answers", () => {
    expect(parseScanResponse({ status: "ok", foods: [food] })).toEqual({
      status: "ok",
      foods: [food],
    });
    expect(parseScanResponse({ status: "not_food" })).toEqual({
      status: "not_food",
    });
  });
  it("rejects a wrong shape instead of throwing", () => {
    expect(parseScanResponse(null)).toBeNull();
    expect(parseScanResponse("oops")).toBeNull();
    expect(parseScanResponse({ status: "ok" })).toBeNull();
    expect(parseScanResponse({ status: "ok", foods: [] })).toBeNull();
    expect(
      parseScanResponse({ status: "ok", foods: [{ ...food, kcal: "165" }] }),
    ).toBeNull();
    expect(
      parseScanResponse({ status: "ok", foods: [{ ...food, name: "" }] }),
    ).toBeNull();
  });
  it("treats an unknown confidence as one to check", () => {
    const r = parseScanResponse({
      status: "ok",
      foods: [{ ...food, confidence: "maybe" }],
    });
    expect(r && r.status === "ok" && r.foods[0].confidence).toBe("check");
  });
});
