// The girih patterns, drawn with react-native-svg on iOS and Android. On the web they are CSS
// backgrounds (girihPattern.web.tsx): one element each instead of a tree of shapes.
import { tile } from "@shawared/design";
import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";

/** An id SVG can reference with url(#…): React's ids carry colons. */
const svgId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

const CELL = 48;
const square = (r: number, rotate: number) => (
  <Rect
    x={CELL / 2 - r}
    y={CELL / 2 - r}
    width={r * 2}
    height={r * 2}
    transform={rotate ? `rotate(${rotate} ${CELL / 2} ${CELL / 2})` : undefined}
  />
);

/** Eight-point stars in saffron lines with dots at the corners, fading downward. Fills its box. */
export function BandPattern({ lines, dots }: { lines: string; dots: string }) {
  const id = svgId(useId());
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id={`${id}p`} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
          <G fill="none" stroke={lines} strokeWidth={1} strokeLinejoin="round">
            {square(11, 0)}
            {square(11, 45)}
            <Path d="M0 0L12 12M48 0L36 12M0 48L12 36M48 48L36 36" />
          </G>
          <G fill={dots}>
            <Circle cx={0} cy={0} r={2} />
            <Circle cx={48} cy={0} r={2} />
            <Circle cx={0} cy={48} r={2} />
            <Circle cx={48} cy={48} r={2} />
          </G>
        </Pattern>
        <LinearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
        <Mask id={`${id}m`}>
          <Rect width="100%" height="100%" fill={`url(#${id}f)`} />
        </Mask>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id}p)`} mask={`url(#${id}m)`} />
    </Svg>
  );
}

/**
 * The cover tile's stars, `cell` px apart, fading in toward the edges, in lines about 0.8 px
 * wide at any size (the pattern is drawn 40 units to a cell). Fills its box.
 */
export function TilePattern({ cell }: { cell: number }) {
  const id = svgId(useId());
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern id={`${id}p`} width={cell} height={cell} patternUnits="userSpaceOnUse">
          <G fill="none" stroke={tile.girih} strokeOpacity={0.55} strokeWidth={(0.8 * 40) / cell} scale={cell / 40}>
            <Rect x={11} y={11} width={18} height={18} />
            <Rect x={11} y={11} width={18} height={18} transform="rotate(45 20 20)" />
            <Path d="M0 0L10 10M40 0L30 10M0 40L10 30M40 40L30 30" />
          </G>
        </Pattern>
        <RadialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={1} />
        </RadialGradient>
        <Mask id={`${id}m`}>
          <Rect width="100%" height="100%" fill={`url(#${id}g)`} />
        </Mask>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id}p)`} mask={`url(#${id}m)`} />
    </Svg>
  );
}
