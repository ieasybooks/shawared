import { mark } from "@shawared/design";
import { Circle, G, Path, Polygon, Rect, Svg } from "./svg";
import { useSettings } from "../../lib/settings";

export type IconName =
  | "play"
  | "pause"
  | "prev"
  | "next"
  | "repeat"
  | "repeatOne"
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
  | "rhymes"
  | "tag"
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
  | "check"
  | "rewind"
  | "forward"
  | "volume"
  | "volumeOff"
  | "clock"
  | "notes"
  | "chevron";

/** Icons that point along the reading direction. They are drawn for left-to-right and mirrored in Arabic. */
const DIRECTIONAL = new Set<IconName>(["play", "prev", "next", "back", "chevron"]);

/** Icons from the 0.4 prototype. */
export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color: string }) {
  const { rtl } = useSettings();
  const flip = rtl && DIRECTIONAL.has(name);
  const stroke = { fill: "none", stroke: color, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" flip={flip}>
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
      {name === "repeatOne" && (
        <G {...stroke} strokeWidth={1.9}>
          <Path d="M17 2l3 3-3 3" />
          <Path d="M4 11V9a4 4 0 0 1 4-4h12" />
          <Path d="M7 22l-3-3 3-3" />
          <Path d="M20 13v2a4 4 0 0 1-4 4H4" />
          {/* One: "١" in Arabic, "1" in English. */}
          <Path strokeWidth={1.7} d={rtl ? "M12.5 9.2l-.8 5.6" : "M10.6 10.3l1.6-1.1v5.6"} />
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
      {name === "rhymes" && (
        <G {...stroke} strokeWidth={1.8}>
          <Path d="M4 8h9M7 16h6" />
          <Circle cx={17.5} cy={8} r={2} />
          <Circle cx={17.5} cy={16} r={2} />
        </G>
      )}
      {name === "tag" && (
        <G {...stroke} strokeWidth={1.8}>
          <Path d="M4 3.5h7.2l9 9a2 2 0 0 1 0 2.8l-5 5a2 2 0 0 1-2.8 0l-9-9V5a1.5 1.5 0 0 1 1.5-1.5Z" />
          <Circle cx={7.5} cy={7.6} r={0.8} fill={color} />
        </G>
      )}
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
      {name === "rewind" && (
        <G fill={color}>
          <Path d="M13 .79c0-.31-.18-.58-.46-.71a.79.79 0 0 0-.85.11L9.29 2.15a.77.77 0 0 0 0 1.2l2.4 1.97c.24.19.57.24.85.11.28-.13.46-.41.46-.72V3.56c4.22.49 7.5 4.08 7.5 8.44a8.5 8.5 0 1 1-14.7-5.82.75.75 0 0 0-1.09-1.02A10 10 0 1 0 13 2.05V.79Z" />
          <Path
            d="M14.24 15.91c-1.74 0-2.78-1.43-2.78-3.65v-.34c0-2.2 1.05-3.64 2.8-3.64 1.75 0 2.78 1.42 2.78 3.64v.34c0 2.2-1.06 3.65-2.8 3.65Zm.01-6.45c-.83 0-1.34.92-1.34 2.47v.33c0 1.54.51 2.47 1.34 2.47.83 0 1.34-.93 1.34-2.47v-.33c0-1.55-.51-2.47-1.34-2.47Z"
            fillRule="evenodd"
          />
          <Path d="M9.47 15.81c-.45 0-.71-.29-.71-.78V9.82h-.03l-.74.52c-.23.15-.37.2-.52.2a.51.51 0 0 1-.52-.52c0-.23.14-.42.41-.6l.96-.68c.39-.26.7-.37 1-.37.52 0 .87.36.87.9v5.76c0 .5-.26.78-.72.78Z" />
        </G>
      )}
      {name === "forward" && (
        <G fill={color}>
          <Path d="M11.46.07a.79.79 0 0 0-.46.72v1.26A10 10 0 1 0 19.29 5.16a.75.75 0 0 0-1.09 1.02A8.5 8.5 0 1 1 11 3.56v1.16c0 .3.18.58.46.71.28.13.61.09.85-.11l2.4-1.97a.77.77 0 0 0 0-1.2L12.31.18a.79.79 0 0 0-.85-.11Z" />
          <Path d="M8.76 15.04c0 .48.26.77.71.77.46 0 .72-.28.72-.77V9.27c0-.54-.35-.9-.87-.9-.3 0-.61.11-1 .37l-.96.67c-.27.18-.41.38-.41.61 0 .3.22.52.52.52.15 0 .29-.05.52-.2l.74-.52h.03v5.22Z" />
          <Path
            d="M11.46 12.26c0 2.22 1.03 3.65 2.77 3.65 1.74 0 2.81-1.45 2.81-3.65v-.34c0-2.22-1.03-3.64-2.78-3.64-1.75 0-2.8 1.44-2.8 3.64v.34Zm1.45-.33c0-1.55.5-2.47 1.34-2.47.83 0 1.34.92 1.34 2.47v.33c0 1.54-.51 2.47-1.34 2.47-.84 0-1.34-.93-1.34-2.47v-.33Z"
            fillRule="evenodd"
          />
        </G>
      )}
      {(name === "volume" || name === "volumeOff") && (
        <G {...stroke} strokeWidth={1.6}>
          <Path d="M3.75 7.75h1.6c.42 0 .83-.13 1.17-.38l4.94-3.55c.33-.24.79 0 .79.4v15.56c0 .4-.46.64-.79.4l-4.94-3.55a2 2 0 0 0-1.17-.38h-1.6a2 2 0 0 1-2-2v-4.5a2 2 0 0 1 2-2z" />
          {name === "volume" ? (
            <Path d="M19.25 4.75a10.25 10.25 0 0 1 0 14.5M15.9 8.1a5.5 5.5 0 0 1 0 7.8" />
          ) : (
            <Path d="M21.5 10l-4.25 4.25M17.25 10l4.25 4.25" />
          )}
        </G>
      )}
      {name === "clock" && (
        <G {...stroke} strokeWidth={1.6}>
          <Circle cx={12} cy={12} r={9.25} />
          <Path d="M12 7.75V12l2.75 2.75" />
        </G>
      )}
      {name === "notes" && (
        <G>
          <Path
            {...stroke}
            strokeWidth={1.6}
            fill="none"
            d="M9.3 18.5l2.06 1.73c.37.31.91.31 1.28 0l2.1-1.74c.18-.15.4-.23.64-.23h2.87a2 2 0 0 0 2-2V5.75a2 2 0 0 0-2-2H5.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h2.9c.24 0 .46.08.65.24z"
          />
          <Path {...stroke} strokeWidth={1.6} d="M15.25 9h-6.5M15.25 13h-6.5" />
        </G>
      )}
      {name === "chevron" && <Path {...stroke} strokeWidth={1.8} d="m9.5 6.75 5.25 5.25-5.25 5.25" />}
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
