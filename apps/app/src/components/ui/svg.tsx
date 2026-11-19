// The shapes icons are drawn with. On iOS and Android, react-native-svg's; on the web, the
// browser's own SVG elements (svg.web.tsx), which cost a page far less to draw.
import type { ReactNode } from "react";
import RNSvg, { Circle, G, Path, Polygon, Rect } from "react-native-svg";

export { Circle, G, Path, Polygon, Rect };

/** An icon's canvas. `flip` mirrors it, for icons that point along the reading direction. */
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
    <RNSvg width={width} height={height} viewBox={viewBox} style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      {children}
    </RNSvg>
  );
}
