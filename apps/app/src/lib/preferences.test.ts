import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, parseSettings, SETTINGS_KEY, THEME_ATTRIBUTE, THEME_PREPAINT_SCRIPT, THEME_WAIT_ATTRIBUTE } from "./preferences";

describe("stored reader preferences", () => {
  it("restores known values while tolerating old, damaged and future settings", () => {
    expect(parseSettings('{"lang":"en","theme":"night","future":true}')).toEqual({ lang: "en", theme: "night" });
    expect(parseSettings('{"lang":"en"}')).toEqual({ lang: "en", theme: "day" });
    for (const raw of [null, "null", "broken", "{}", '{"lang":"fr","theme":"automatic"}']) {
      expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
    }
  });

  it("holds night paint until restoration, with a four-second fail-open when scripts cannot load", () => {
    const attributes = new Map<string, string>();
    const root = {
      setAttribute: (key: string, value: string) => attributes.set(key, value),
      removeAttribute: (key: string) => attributes.delete(key),
    };
    const storage = { getItem: vi.fn(() => '{"theme":"night"}') };
    const timer = vi.fn();
    new Function("document", "localStorage", "setTimeout", THEME_PREPAINT_SCRIPT)({ documentElement: root }, storage, timer);
    expect(storage.getItem).toHaveBeenCalledWith(SETTINGS_KEY);
    expect(attributes.get(THEME_ATTRIBUTE)).toBe("night");
    expect(attributes.has(THEME_WAIT_ATTRIBUTE)).toBe(true);
    expect(timer).toHaveBeenCalledWith(expect.any(Function), 4000);
    timer.mock.calls[0]![0]();
    expect(attributes.has(THEME_WAIT_ATTRIBUTE)).toBe(false);
    expect(attributes.get(THEME_ATTRIBUTE)).toBe("night");
  });

  it("shows day pages even when saved settings are invalid or storage is unavailable", () => {
    const root = { setAttribute: vi.fn(), removeAttribute: vi.fn() };
    const timer = vi.fn();
    const prepaint = new Function("document", "localStorage", "setTimeout", THEME_PREPAINT_SCRIPT);
    for (const raw of [null, "null", "broken", '{"theme":"day"}', '{"theme":"future"}']) {
      prepaint({ documentElement: root }, { getItem: () => raw }, timer);
    }
    prepaint(
      { documentElement: root },
      {
        getItem: () => {
          throw new Error("storage disabled");
        },
      },
      timer,
    );
    expect(root.setAttribute).not.toHaveBeenCalled();
    expect(timer).not.toHaveBeenCalled();
  });
});
