import { describe, expect, it } from "vitest";
import { addressOf } from "./loaderKey";

describe("addressOf", () => {
  it("gives the address each kind of page's loader data is filed under", () => {
    expect(addressOf("/(tabs)/index")).toBe("/");
    expect(addressOf("/(tabs)/poets")).toBe("/poets");
    expect(addressOf("/en/(tabs)/index")).toBe("/en");
    expect(addressOf("/en/(tabs)/meters")).toBe("/en/meters");
    expect(addressOf("/poems/al-bassama")).toBe("/poems/al-bassama");
    expect(addressOf("/en/poets/ibn-abdun")).toBe("/en/poets/ibn-abdun");
    expect(addressOf("/poems/al-bassama?b=7")).toBe("/poems/al-bassama");
  });
});
