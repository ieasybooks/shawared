// The browser's own SVG elements, for icons on the web: react-native-svg wraps each shape in
// a component that works out its props on every render, which on a poem page (a hundred
// icons and more) costs a noticeable part of drawing it.
import type { ReactNode, SVGProps } from "react";

type Shape<T extends SVGElement> = SVGProps<T>;

export function Svg({
  width,
  height,
  viewBox,
  flip,
  children,
}: {
  width: number;
  height: number;
  viewBox: string;
  flip?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flexShrink: 0, ...(flip ? { transform: "scaleX(-1)" } : null) }}
    >
      {children}
    </svg>
  );
}

export const G = (p: Shape<SVGGElement>) => <g {...p} />;
export const Path = (p: Shape<SVGPathElement>) => <path {...p} />;
export const Rect = (p: Shape<SVGRectElement>) => <rect {...p} />;
export const Circle = (p: Shape<SVGCircleElement>) => <circle {...p} />;
export const Polygon = (p: Shape<SVGPolygonElement>) => <polygon {...p} />;
