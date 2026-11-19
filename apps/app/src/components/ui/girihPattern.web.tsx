// The girih patterns on the web: an SVG tile repeated as a CSS background and faded with a
// CSS mask. One element each, where react-native-svg would draw a tree of shapes.
import { tile } from "@shawared/design";

const cache = new Map<string, string>();
const dataUri = (svg: string) => {
  let uri = cache.get(svg);
  if (!uri) cache.set(svg, (uri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`));
  return uri;
};

const fill = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" } as const;

/** Eight-point stars in saffron lines with dots at the corners, fading downward. Fills its box. */
export function BandPattern({ lines, dots }: { lines: string; dots: string }) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><g fill="none" stroke="${lines}" stroke-width="1" stroke-linejoin="round">` +
    `<rect x="13" y="13" width="22" height="22"/><rect x="13" y="13" width="22" height="22" transform="rotate(45 24 24)"/>` +
    `<path d="M0 0L12 12M48 0L36 12M0 48L12 36M48 48L36 36"/></g><g fill="${dots}"><circle cx="0" cy="0" r="2"/><circle cx="48" cy="0" r="2"/>` +
    `<circle cx="0" cy="48" r="2"/><circle cx="48" cy="48" r="2"/></g></svg>`;
  const mask = "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))";
  return (
    <div
      aria-hidden="true"
      style={{ ...fill, backgroundImage: dataUri(svg), backgroundSize: "48px 48px", maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

/**
 * The cover tile's stars, `cell` px apart, fading in toward the edges, in lines about 0.8 px
 * wide at any size (the pattern is drawn 40 units to a cell). Fills its box.
 */
export function TilePattern({ cell }: { cell: number }) {
  const width = (0.8 * 40) / cell;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="${cell}" viewBox="0 0 40 40"><g fill="none" stroke="${tile.girih}" stroke-opacity="0.55" stroke-width="${width.toFixed(2)}">` +
    `<rect x="11" y="11" width="18" height="18"/><rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)"/>` +
    `<path d="M0 0L10 10M40 0L30 10M0 40L10 30M40 40L30 30"/></g></svg>`;
  const mask = "radial-gradient(circle, transparent 32%, black 75%)";
  return (
    <div
      aria-hidden="true"
      style={{ ...fill, backgroundImage: dataUri(svg), backgroundSize: `${cell}px ${cell}px`, maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}
