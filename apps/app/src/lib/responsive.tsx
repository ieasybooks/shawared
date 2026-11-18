import { useEffect, useState, type ReactNode } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { useWindowWidth } from "./viewport";

// Phones and wide windows lay pages out differently: the top and tab bars or the site header,
// the poem's explanation in a sheet or beside the verses, a few sizes.
//
// Web pages are rendered ahead of time, without a window, and the browser picks them up
// (hydration) by rendering exactly what the server did. So on the web the switch is CSS: what
// differs is written for both layouts, and the page's base stylesheet (RESPONSIVE_CSS, in
// app/+html.tsx) shows one or the other from WIDE_MIN. A page shows in its layout before its
// scripts run, the browser renders the same page at every width, and resizing the window
// switches the layout without React. The apps have no CSS: they pick in JavaScript from their
// window's width, and render only what they show.

/** From this width the desktop layout shows: the site header, the explanation beside the verses. */
export const WIDE_MIN = 960;

const web = Platform.OS === "web";

/**
 * The switch: two custom properties, each either empty, which hides the value it guards, or
 * unset, which lets it through. `var(--phone-off,P) var(--wide-off,W)` reads P below WIDE_MIN
 * and W from it, so one CSS value carries both layouts.
 */
export const RESPONSIVE_CSS = `:root { --wide-off: ; }
@media (min-width: ${WIDE_MIN}px) { :root { --wide-off: initial; --phone-off: ; } }`;

type Value = number | string;
/** Style properties whose numbers have no unit; every other number is in px. */
const UNITLESS = new Set(["flex", "flexGrow", "flexShrink", "opacity", "zIndex", "fontWeight", "aspectRatio"]);
const css = (prop: string | null, v: Value) => (typeof v === "number" && !(prop && UNITLESS.has(prop)) ? `${v}px` : String(v));

/** On the web: one CSS value that is `phone` below WIDE_MIN and `wide` from it. */
function either(phone: Value, wide: Value, prop: string | null = null): Value {
  if (phone === wide) return phone;
  return `var(--phone-off,${css(prop, phone)}) var(--wide-off,${css(prop, wide)})`;
}

/** A style that differs between phones and wide windows, made by `responsive`. */
export type Responsive<S> = { readonly phone: S; readonly wide: S; readonly both: S };

/**
 * A style for phones and one for wide windows, with the same properties. On the web the two
 * are compiled into one, switched by CSS. Call it at a module's top level: React Native Web
 * writes its style sheet into a page before rendering it, so a style compiled while rendering
 * would be missing from the first page rendered ahead of time.
 */
export function responsive<S extends object>(phone: S, wide: S): Responsive<S> {
  if (!web) return { phone, wide, both: phone };
  const p = phone as Record<string, Value>;
  const w = wide as Record<string, Value>;
  const out: Record<string, Value> = {};
  for (const prop of new Set([...Object.keys(p), ...Object.keys(w)])) {
    const [a, b] = [p[prop], w[prop]];
    if (a === undefined || b === undefined) throw new Error(`responsive: give ${prop} for phones and for wide windows`);
    if (typeof a === "object" || typeof b === "object") {
      // Transforms, shadow offsets: the same for both, or not at all.
      if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`responsive: ${prop} can't differ between layouts`);
      out[prop] = a;
    } else out[prop] = either(a, b, prop);
  }
  return { phone, wide, both: StyleSheet.create({ both: out as S }).both };
}

/** How to style for phones and wide windows here. */
export type Layout = {
  /** Whether the window is wide: the apps know; on the web it's CSS's business (undefined). */
  wide: boolean | undefined;
  /** The style for this window (on the web, both, switched by CSS). */
  style: <S>(r: Responsive<S>) => S;
  /**
   * A value for this window, for a style made while rendering. On the web it is a CSS value:
   * scale it with `scale`, never with arithmetic.
   */
  value: <T extends Value>(phone: T, wide: T) => T;
};

const WEB: Layout = {
  wide: undefined,
  style: (r) => r.both,
  value: (phone, wide) => either(phone, wide) as typeof phone,
};
const nativeLayout = (wide: boolean): Layout => ({
  wide,
  style: (r) => (wide ? r.wide : r.phone),
  value: (phone, wideValue) => (wide ? wideValue : phone),
});
const PHONE = nativeLayout(false);
const WIDE = nativeLayout(true);

/** How to style for this window: the apps pick by their width; the web leaves it to CSS. */
export const useLayout: () => Layout = web ? () => WEB : () => (useWindowWidth() >= WIDE_MIN ? WIDE : PHONE);

/** `k` times a size from `Layout.value`, plus `add` px, as a style value. */
export function scale(size: number, k: number, add = 0): number {
  if (typeof size === "number") return size * k + add;
  const plus = add ? ` ${add < 0 ? "-" : "+"} ${Math.abs(add)}px` : "";
  return `calc(${k} * (${size as string})${plus})` as unknown as number;
}

/** Whether the window is wide now: for what a tap does, never for what renders. */
export function isWide(): boolean {
  if (web) return typeof matchMedia === "function" && matchMedia(`(min-width: ${WIDE_MIN}px)`).matches;
  return Dimensions.get("window").width >= WIDE_MIN;
}

/** Changes whenever the window crosses WIDE_MIN: a dependency for effects that follow the layout. */
export function useLayoutChanges(): unknown {
  const { wide } = useLayout();
  const [changes, setChanges] = useState(0);
  useEffect(() => {
    if (!web) return;
    const query = matchMedia(`(min-width: ${WIDE_MIN}px)`);
    const changed = () => setChanges((n) => n + 1);
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  return web ? changes : wide;
}

// A box that isn't one (display: contents): what it holds lays out as if it weren't there.
const only = web
  ? {
      phone: responsive({ display: "contents" as const }, { display: "none" as const }).both,
      wide: responsive({ display: "none" as const }, { display: "contents" as const }).both,
    }
  : null;

/**
 * What shows only on phones or only on wide windows. On the web it is rendered for both and
 * CSS hides it in the other layout, so keep it small (bars, a few controls), never a poem's
 * verses. The apps render it only where it shows.
 */
export function Only({ on, children }: { on: "phone" | "wide"; children: ReactNode }) {
  const { wide } = useLayout();
  if (only) return <View style={only[on]}>{children}</View>;
  return wide === (on === "wide") ? children : null;
}
