import { useWindowWidth } from "../../lib/viewport";

/** From this width the web shows the desktop layout: header navigation, side panels. */
export const WIDE_MIN = 960;

/** Whether to show the desktop layout. */
export const useWide = () => useWindowWidth() >= WIDE_MIN;
