import { mark } from "@shawared/design";
import Svg, { Circle, G, Path, Polygon, Rect } from "react-native-svg";

export type IconName = "play" | "pause" | "prev" | "next" | "repeat" | "close" | "up" | "down" | "back" | "more" | "chevron";

/** Icons from the 0.4 prototype. `flip` mirrors direction-bound icons in left-to-right layouts. */
export function Icon({ name, size = 22, color, flip = false }: { name: IconName; size?: number; color: string; flip?: boolean }) {
  const style = flip ? { transform: [{ scaleX: -1 }] } : undefined;
  const stroke = { fill: "none", stroke: color, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {name === "play" && <Path fill={color} d="M8 5.2v13.6a1 1 0 0 0 1.53.85l10.5-6.8a1 1 0 0 0 0-1.7L9.53 4.35A1 1 0 0 0 8 5.2z" />}
      {name === "pause" && (
        <G fill={color}>
          <Rect x={6} y={5} width={4.2} height={14} rx={1.3} />
          <Rect x={13.8} y={5} width={4.2} height={14} rx={1.3} />
        </G>
      )}
      {name === "prev" && (
        <G fill={color}>
          <Rect x={17} y={5} width={2.4} height={14} rx={1.2} />
          <Path d="M5 5.6v12.8a1 1 0 0 0 1.5.86l9.6-6.4a1 1 0 0 0 0-1.72L6.5 4.74A1 1 0 0 0 5 5.6z" />
        </G>
      )}
      {name === "next" && (
        <G fill={color}>
          <Rect x={4.6} y={5} width={2.4} height={14} rx={1.2} />
          <Path d="M19 5.6v12.8a1 1 0 0 1-1.5.86l-9.6-6.4a1 1 0 0 1 0-1.72l9.6-6.4A1 1 0 0 1 19 5.6z" />
        </G>
      )}
      {name === "repeat" && (
        <G {...stroke} strokeWidth={1.9}>
          <Path d="M17 2l3 3-3 3" />
          <Path d="M4 11V9a4 4 0 0 1 4-4h12" />
          <Path d="M7 22l-3-3 3-3" />
          <Path d="M20 13v2a4 4 0 0 1-4 4H4" />
        </G>
      )}
      {name === "close" && <Path {...stroke} strokeWidth={2} d="M6 6l12 12M18 6L6 18" />}
      {name === "up" && <Path {...stroke} strokeWidth={2} d="M6 15l6-6 6 6" />}
      {name === "down" && <Path {...stroke} strokeWidth={2} d="M6 9l6 6 6-6" />}
      {name === "back" && <Path {...stroke} strokeWidth={2} d="M9 6l6 6-6 6" />}
      {name === "chevron" && <Path {...stroke} strokeWidth={2} d="M15 6l-6 6 6 6" />}
      {name === "more" && (
        <G fill={color}>
          <Circle cx={5} cy={12} r={1.8} />
          <Circle cx={12} cy={12} r={1.8} />
          <Circle cx={19} cy={12} r={1.8} />
        </G>
      )}
    </Svg>
  );
}

/** Mark A. */
export function Logo({ size, color, dot }: { size: number; color: string; dot: string }) {
  return (
    <Svg width={size} height={size} viewBox={mark.viewBox}>
      <Path d={mark.stroke} fill="none" stroke={color} strokeWidth={mark.strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
      {mark.dots.map((points) => (
        <Polygon key={points} points={points} fill={dot} />
      ))}
    </Svg>
  );
}
