import { mark } from "@shawared/design";
import Svg, { Circle, G, Path, Polygon, Rect } from "react-native-svg";
import { useSettings } from "../../lib/settings";

export type IconName =
  | "play"
  | "pause"
  | "prev"
  | "next"
  | "repeat"
  | "continuous"
  | "close"
  | "up"
  | "down"
  | "back"
  | "sun"
  | "moon"
  | "globe"
  | "home"
  | "quill"
  | "mic"
  | "waves"
  | "search"
  | "link"
  | "info"
  | "heart"
  | "heartFull"
  | "listAdd"
  | "download"
  | "downloaded"
  | "library"
  | "plus"
  | "trash"
  | "edit"
  | "check";

/** Icons that point along the reading direction. They are drawn for left-to-right and mirrored in Arabic. */
const DIRECTIONAL = new Set<IconName>(["play", "prev", "next", "back"]);

/** Icons from the 0.4 prototype. */
export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  const { rtl } = useSettings();
  const style = rtl && DIRECTIONAL.has(name) ? { transform: [{ scaleX: -1 }] } : undefined;
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
          <Rect x={4.6} y={5} width={2.4} height={14} rx={1.2} />
          <Path d="M19 5.6v12.8a1 1 0 0 1-1.5.86l-9.6-6.4a1 1 0 0 1 0-1.72l9.6-6.4A1 1 0 0 1 19 5.6z" />
        </G>
      )}
      {name === "next" && (
        <G fill={color}>
          <Rect x={17} y={5} width={2.4} height={14} rx={1.2} />
          <Path d="M5 5.6v12.8a1 1 0 0 0 1.5.86l9.6-6.4a1 1 0 0 0 0-1.72L6.5 4.74A1 1 0 0 0 5 5.6z" />
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
      {name === "continuous" && (
        <Path
          {...stroke}
          strokeWidth={1.9}
          d="M12 12c-1.5-2.2-3-3.6-4.8-3.6a3.6 3.6 0 0 0 0 7.2c1.8 0 3.3-1.4 4.8-3.6zm0 0c1.5 2.2 3 3.6 4.8 3.6a3.6 3.6 0 0 0 0-7.2c-1.8 0-3.3 1.4-4.8 3.6z"
        />
      )}
      {name === "close" && <Path {...stroke} strokeWidth={2} d="M6 6l12 12M18 6L6 18" />}
      {name === "up" && <Path {...stroke} strokeWidth={2} d="M6 15l6-6 6 6" />}
      {name === "down" && <Path {...stroke} strokeWidth={2} d="M6 9l6 6 6-6" />}
      {name === "back" && <Path {...stroke} strokeWidth={2} d="M15 6l-6 6 6 6" />}
      {name === "home" && <Path {...stroke} strokeWidth={1.8} d="M4 10.4 12 4l8 6.4V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />}
      {name === "quill" && (
        <G {...stroke} strokeWidth={1.8}>
          <Path d="M20 4c-7 .6-11.6 5.4-12.8 11.6L6.4 20" />
          <Path d="M20 4c-.4 6.6-4.6 11-11.2 12.2" />
          <Path d="M9.6 12.2l3.4.4" />
        </G>
      )}
      {name === "mic" && (
        <G {...stroke} strokeWidth={1.8}>
          <Rect x={9} y={3.5} width={6} height={11} rx={3} />
          <Path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.7V20.5M9 20.5h6" />
        </G>
      )}
      {name === "waves" && <Path {...stroke} strokeWidth={1.8} d="M4 10.5v3M8 7.5v9M12 4.5v15M16 8v8M20 10.5v3" />}
      {name === "search" && (
        <G {...stroke} strokeWidth={1.9}>
          <Circle cx={11} cy={11} r={6.5} />
          <Path d="M20 20l-4.2-4.2" />
        </G>
      )}
      {name === "link" && (
        <Path
          {...stroke}
          strokeWidth={1.9}
          d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"
        />
      )}
      {name === "sun" && (
        <G {...stroke} strokeWidth={1.9}>
          <Circle cx={12} cy={12} r={4} />
          <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </G>
      )}
      {name === "moon" && <Path {...stroke} strokeWidth={1.9} d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z" />}
      {name === "info" && (
        <G {...stroke} strokeWidth={1.8}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 11v5.5" />
          <Circle cx={12} cy={7.6} r={0.4} strokeWidth={2.2} />
        </G>
      )}
      {(name === "heart" || name === "heartFull") && (
        <Path
          {...stroke}
          strokeWidth={1.9}
          fill={name === "heartFull" ? color : "none"}
          d="M12 20.2s-8.2-4.7-8.2-10.6A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 8.2 2.3c0 5.9-8.2 10.6-8.2 10.6z"
        />
      )}
      {name === "listAdd" && <Path {...stroke} strokeWidth={1.9} d="M4 6.5h12M4 11.5h12M4 16.5h7M18 13.5v7M14.5 17h7" />}
      {name === "download" && <Path {...stroke} strokeWidth={1.9} d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />}
      {name === "downloaded" && <Path {...stroke} strokeWidth={1.9} d="M5 19.5h14M7.5 11.5l3.2 3.2 6-6.2" />}
      {name === "library" && <Path {...stroke} strokeWidth={1.8} d="M5.5 4.5v14.5M10 4.5v14.5M14 5.8l4.3 13.2M3.5 19.5h17" />}
      {name === "plus" && <Path {...stroke} strokeWidth={2} d="M12 5v14M5 12h14" />}
      {name === "check" && <Path {...stroke} strokeWidth={2} d="M5 12.5l4.5 4.5L19 7.5" />}
      {name === "trash" && (
        <G {...stroke} strokeWidth={1.8}>
          <Path d="M4.5 7h15M9.5 7V4.8h5V7M10 10.5v6M14 10.5v6" />
          <Path d="M6.5 7l.9 12.1a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9L17.5 7" />
        </G>
      )}
      {name === "edit" && (
        <G {...stroke} strokeWidth={1.8}>
          <Path d="M4.5 19.5l1-4.2L15.8 5a1.8 1.8 0 0 1 2.6 0l.6.6a1.8 1.8 0 0 1 0 2.6L8.7 18.5z" />
          <Path d="M14 6.8l3.2 3.2" />
        </G>
      )}
      {name === "globe" && (
        <G {...stroke} strokeWidth={1.8}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" />
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
