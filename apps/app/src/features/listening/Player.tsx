import { useMemo } from "react";
import { PhoneBar, WideBar, type BarSource } from "../player/PlayerBar";
import { nowItemOf } from "../player/item";
import { useListening } from "./state";

/** The poem page's recitation as a player bar's source: ready before it plays, and following the page. */
function usePoemSource(): BarSource {
  const { bundle, recitation, playback, jump } = useListening();
  return useMemo(
    () => ({
      ...nowItemOf(bundle, recitation)!,
      reciterId: recitation.reciter,
      duration: recitation.duration,
      track: playback.track,
      clock: playback.clock,
      toggle: playback.toggle,
      jump,
    }),
    [bundle, recitation, playback, jump],
  );
}

export function PhonePlayer() {
  return <PhoneBar source={usePoemSource()} />;
}

export function WidePlayer() {
  return <WideBar source={usePoemSource()} />;
}
