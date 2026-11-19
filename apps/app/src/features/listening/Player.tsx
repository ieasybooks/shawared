import { useMemo } from "react";
import { PhoneBar, WideBar, type BarSource } from "../player/PlayerBar";
import { useListening } from "./state";

/** The poem page's recitation as a player bar's source: ready before it plays, and following the page. */
function usePoemSource(): BarSource {
  const { bundle, recitation, playback, jump } = useListening();
  return useMemo(
    () => ({
      poemId: bundle.poem.id,
      title: bundle.poem.title,
      poet: bundle.poet.name,
      reciter: bundle.reciters[recitation.reciter]?.name ?? recitation.reciter,
      reciterId: recitation.reciter,
      abyat: bundle.poem.abyat.length,
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
