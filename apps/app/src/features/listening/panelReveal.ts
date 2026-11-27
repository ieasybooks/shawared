import { space } from "@shawared/design";

type Measurable = {
  measureInWindow: (measured: (x: number, y: number, width: number, height: number) => void) => void;
};

/** Keep the requested note until the panel is open and its layout can be measured. */
export function createPanelReveal(viewport: () => Measurable | null, scrollTo: (y: number) => void) {
  let target: Measurable | null = null;
  let ready = false;
  let offset = 0;
  let revision = 0;
  let frame: number | undefined;

  const layout = () => {
    revision++;
    if (!ready || !target || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      const node = target;
      const box = viewport();
      const measuredRevision = revision;
      if (!ready || !node || !box) return;
      node.measureInWindow((_x, top, width, height) => {
        if (width <= 0 || height <= 0) return;
        box.measureInWindow((_bx, boxTop, boxWidth, boxHeight) => {
          if (!ready || target !== node || measuredRevision !== revision || boxWidth <= 0 || boxHeight <= 0) return;
          const margin = space.xl;
          if (top >= boxTop + margin && top + height <= boxTop + boxHeight - margin) return;
          scrollTo(Math.max(0, offset + top - boxTop - margin));
        });
      });
    });
  };

  return {
    request(node: Measurable | null) {
      target = node;
      layout();
      return () => {
        if (target !== node) return;
        target = null;
        revision++;
      };
    },
    layout,
    setReady(next: boolean) {
      ready = next;
      layout();
    },
    scrolled(y: number) {
      if (offset !== y) revision++;
      offset = y;
    },
    clear() {
      target = null;
      revision++;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    },
  };
}
