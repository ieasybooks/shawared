import { useSyncExternalStore } from "react";
import { Dimensions } from "react-native";

// Web pages are rendered ahead of time, without a window. A browser first renders exactly what
// the server did (React's hydration), then once more for its own window. The apps have no
// server render, so they use their window from the start.

const subscribeWindow = (fn: () => void) => Dimensions.addEventListener("change", fn).remove;
const windowWidth = () => Dimensions.get("window").width;
/** What the server renders for: a phone. */
const SERVER_WIDTH = 0;

/** The window's width, safe to render with on every platform. */
export function useWindowWidth(): number {
  return useSyncExternalStore(subscribeWindow, windowWidth, () => SERVER_WIDTH);
}

const subscribeNothing = () => () => {};

/** False while rendering on the server and while the browser hydrates; true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}
