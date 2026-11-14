// One alert for phone and web (lib/alert): the phone uses React Native's Alert; the web, where
// Alert.alert does nothing, uses the browser's alert and confirm with the same buttons.
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { alert } from "@/lib/alert";

// Hoisted above the import by Jest, so alert.ts sees this react-native.
jest.mock("react-native", () => ({
  Platform: { OS: "web" },
  Alert: { alert: jest.fn() },
}));

const mockRn = jest.requireMock("react-native") as {
  Platform: { OS: string };
  Alert: { alert: jest.Mock };
};

const g = globalThis as unknown as {
  alert?: (t: string) => void;
  confirm?: (t: string) => boolean;
};
let answers: boolean[] = [];
const seen: string[] = [];

beforeEach(() => {
  mockRn.Platform.OS = "web";
  mockRn.Alert.alert.mockClear();
  answers = [];
  seen.length = 0;
  g.alert = (t) => void seen.push(`alert:${t}`);
  g.confirm = (t) => {
    seen.push(`confirm:${t}`);
    return answers.shift() ?? false;
  };
});
afterEach(() => {
  delete g.alert;
  delete g.confirm;
});

describe("alert", () => {
  it("on a phone, passes straight to React Native", () => {
    mockRn.Platform.OS = "android";
    const buttons = [{ text: "OK" }];
    alert("Saved", "All good", buttons);
    expect(mockRn.Alert.alert).toHaveBeenCalledWith(
      "Saved",
      "All good",
      buttons,
    );
    expect(seen).toEqual([]);
  });

  it("web, no buttons: the browser alert with title and message", () => {
    alert("Saved", "All good");
    expect(seen).toEqual(["alert:Saved\n\nAll good"]);
  });

  it("web, one button: alert, then that button's action", () => {
    const ok = jest.fn();
    alert("Done", undefined, [{ text: "OK", onPress: ok }]);
    expect(seen).toEqual(["alert:Done"]);
    expect(ok).toHaveBeenCalled();
  });

  it("web, an action beside Cancel: OK runs the action, Cancel runs cancel", () => {
    const del = jest.fn();
    const cancel = jest.fn();
    const buttons = [
      { text: "Cancel", style: "cancel" as const, onPress: cancel },
      { text: "Delete", style: "destructive" as const, onPress: del },
    ];
    answers = [true];
    alert("Delete this?", undefined, buttons);
    expect(del).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();

    answers = [false];
    alert("Delete this?", undefined, buttons);
    expect(del).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("web, several actions: asks one at a time until one is accepted", () => {
    const a = jest.fn();
    const b = jest.fn();
    answers = [false, true];
    alert("Choose", "Pick one", [
      { text: "First", onPress: a },
      { text: "Second", onPress: b },
    ]);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
    expect(seen).toEqual([
      "confirm:Choose\n\nPick one\n\nFirst?",
      "confirm:Choose\n\nPick one\n\nSecond?",
    ]);
  });

  it("web, several actions all declined: runs cancel", () => {
    const cancel = jest.fn();
    alert("Choose", undefined, [
      { text: "A", onPress: jest.fn() },
      { text: "B", onPress: jest.fn() },
      { text: "Cancel", style: "cancel", onPress: cancel },
    ]);
    expect(cancel).toHaveBeenCalled();
  });
});
