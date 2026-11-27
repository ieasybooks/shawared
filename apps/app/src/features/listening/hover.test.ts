import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createListeningHover } from "./hover";

const rect = { x: 40, y: 100, w: 30, h: 20 };

beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] }));
afterEach(() => vi.useRealTimers());

describe("a poem page's hover", () => {
  it("does not share word addresses or bayt numbers with retained poem pages", () => {
    const first = createListeningHover();
    const second = createListeningHover();
    first.bayt.set({ n: 1 });
    first.enterWord("1.1.1", () => rect);
    vi.advanceTimersByTime(450);
    expect(first.word.get()).toEqual({ key: "1.1.1", rect });
    expect(second.word.get()).toEqual({ key: null, rect: null });
    expect(second.bayt.get().n).toBeNull();

    second.enterWord("1.1.1", () => ({ ...rect, y: 200 }));
    expect(second.word.get().key).toBeNull();
    vi.advanceTimersByTime(450);
    expect(first.word.get().rect?.y).toBe(100);
    expect(second.word.get().rect?.y).toBe(200);
  });

  it("ignores passing over words and opens adjacent words immediately while warm", () => {
    const hover = createListeningHover();
    hover.enterWord("1.1.1", () => rect);
    vi.advanceTimersByTime(449);
    expect(hover.word.get().key).toBeNull();
    hover.leaveWord();
    vi.advanceTimersByTime(1);
    expect(hover.word.get().key).toBeNull();

    hover.enterWord("1.1.2", () => rect);
    vi.advanceTimersByTime(450);
    hover.enterWord("1.1.3", () => rect);
    expect(hover.word.get().key).toBe("1.1.3");
    hover.leaveWord();
    vi.advanceTimersByTime(149);
    expect(hover.word.get().key).toBe("1.1.3");
    vi.advanceTimersByTime(1);
    expect(hover.word.get().key).toBeNull();
    vi.advanceTimersByTime(399);
    hover.enterWord("1.1.4", () => rect);
    expect(hover.word.get().key).toBe("1.1.4");
  });

  it("clears delayed work and warmth when a retained route loses focus", () => {
    const hover = createListeningHover();
    const measure = vi.fn(() => rect);
    hover.bayt.set({ n: 9 });
    hover.enterWord("9.1.1", measure);
    hover.reset();
    vi.runAllTimers();
    expect(measure).not.toHaveBeenCalled();
    expect(hover.bayt.get().n).toBeNull();
    expect(hover.word.get().key).toBeNull();

    hover.enterWord("1.1.1", measure);
    vi.advanceTimersByTime(450);
    hover.leaveWord();
    vi.advanceTimersByTime(150);
    hover.reset();
    hover.enterWord("1.1.2", measure);
    expect(hover.word.get().key).toBeNull();
    vi.advanceTimersByTime(450);
    expect(hover.word.get().key).toBe("1.1.2");
  });
});
