import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPanelReveal } from "./panelReveal";

const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
const paint = () => {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((callback) => callback(0));
};
type Bounds = { top: number; height: number };
const node = (bounds: Bounds) => ({
  measureInWindow: (measured: (x: number, y: number, width: number, height: number) => void) => measured(0, bounds.top, 288, bounds.height),
});

beforeEach(() => {
  frames.clear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});
afterEach(() => vi.unstubAllGlobals());

describe("focused word reveal", () => {
  it("waits for opening and retries when delayed note layout becomes measurable", () => {
    const box = node({ top: 100, height: 200 });
    const bounds = { top: 480, height: 0 };
    const scroll = vi.fn();
    const reveal = createPanelReveal(() => box, scroll);
    reveal.request(node(bounds));
    reveal.layout();
    paint();
    expect(scroll).not.toHaveBeenCalled();

    reveal.setReady(true);
    paint();
    expect(scroll).not.toHaveBeenCalled();
    bounds.height = 40;
    reveal.layout();
    reveal.layout();
    paint();
    expect(scroll).toHaveBeenCalledTimes(1);
    const destination = scroll.mock.calls[0]![0] as number;
    expect(bounds.top - destination).toBeGreaterThan(100);
    expect(bounds.top - destination + bounds.height).toBeLessThan(300);
  });

  it("leaves a comfortable note still and uses the scroll offset after a later layout", () => {
    const box = node({ top: 100, height: 200 });
    const bounds = { top: 150, height: 40 };
    const scroll = vi.fn();
    const reveal = createPanelReveal(() => box, scroll);
    reveal.setReady(true);
    reveal.request(node(bounds));
    paint();
    expect(scroll).not.toHaveBeenCalled();
    reveal.scrolled(200);
    bounds.top = 350;
    reveal.layout();
    paint();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.calls[0]![0]).toBeGreaterThan(400);
  });

  it.each(["note", "viewport"])("ignores a delayed %s measurement after the reader scrolls", (delayed) => {
    let finish: (() => void) | undefined;
    let holdMeasurement = true;
    const bounds = { top: 500, height: 40 };
    const measure = (kind: string, bounds: Bounds) => ({
      measureInWindow: (measured: (x: number, y: number, width: number, height: number) => void) => {
        const { top, height } = bounds;
        const deliver = () => measured(0, top, 288, height);
        if (holdMeasurement && kind === delayed) finish = deliver;
        else deliver();
      },
    });
    const box = measure("viewport", { top: 100, height: 200 });
    const scroll = vi.fn();
    const reveal = createPanelReveal(() => box, scroll);
    reveal.setReady(true);
    reveal.request(measure("note", bounds));
    paint();

    reveal.scrolled(100);
    bounds.top -= 100;
    holdMeasurement = false;
    finish?.();
    paint();
    expect(scroll).not.toHaveBeenCalled();

    // A later layout can reveal the note using measurements from the new scroll position.
    reveal.layout();
    paint();
    expect(scroll).toHaveBeenCalledExactlyOnceWith(384);
  });

  it("ignores a stale measurement after another note is selected or the request is cancelled", () => {
    let finish: ((x: number, y: number, width: number, height: number) => void) | undefined;
    const delayed = {
      measureInWindow: (measured: NonNullable<typeof finish>) => {
        finish = measured;
      },
    };
    const scroll = vi.fn();
    const reveal = createPanelReveal(() => node({ top: 100, height: 200 }), scroll);
    reveal.setReady(true);
    reveal.request(delayed);
    paint();
    const cancel = reveal.request(node({ top: 140, height: 40 }));
    finish?.(0, 500, 288, 40);
    paint();
    expect(scroll).not.toHaveBeenCalled();
    cancel();
    reveal.layout();
    paint();
    expect(scroll).not.toHaveBeenCalled();
  });

  it("cancels an in-flight measurement when its panel closes", () => {
    let finish: ((x: number, y: number, width: number, height: number) => void) | undefined;
    const scroll = vi.fn();
    const reveal = createPanelReveal(() => node({ top: 100, height: 200 }), scroll);
    reveal.setReady(true);
    reveal.request({
      measureInWindow: (measured) => {
        finish = measured;
      },
    });
    paint();
    reveal.setReady(false);
    finish?.(0, 500, 288, 40);
    expect(scroll).not.toHaveBeenCalled();
  });
});
