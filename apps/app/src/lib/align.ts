import { Platform } from "react-native";

type Side = "left" | "right";

/**
 * textAlign for the start and end of a box laid out in `dir`. iOS and Android read
 * left/right as start/end inside right-to-left layouts; the web reads them literally.
 */
export function alignFor(dir: "rtl" | "ltr"): { start: Side; end: Side } {
  if (Platform.OS !== "web" || dir === "ltr") return { start: "left", end: "right" };
  return { start: "right", end: "left" };
}

/** Inside a right-to-left Arabic box (`<Dir dir="rtl">`): where the sadr and ajuz sit. */
export const ARABIC = alignFor("rtl");

/**
 * textAlign for a TextInput. Unlike Text, a TextInput on iOS and Android isn't told the
 * layout's direction, so left and right are the physical sides on every platform.
 */
export const inputAlign = (dir: "ltr" | "rtl") => (dir === "rtl" ? "right" : "left");
