import type { PoemBundle } from "@shawared/contracts";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { usePoemBundle } from "../../lib/content";
import { useSettings } from "../../lib/settings";
import { useWide } from "../navigation/layout";
import { CompactLayout, WideLayout } from "./layouts";
import { ListeningProvider, useListening } from "./state";

/** A poem: its verses with the recitation, explanations and word meanings. */
export function ListeningScreen({
  id,
  bayt,
  initial,
}: {
  id: string;
  /** Opened from a link to one bayt. */
  bayt?: number | undefined;
  initial?: { bundle: PoemBundle } | undefined;
}) {
  const { lang } = useSettings();
  const wide = useWide();
  const { data, error, retry } = usePoemBundle(id, lang, initial?.bundle.lang === lang ? initial.bundle : undefined);
  // Switching language loads another bundle; keep the current one meanwhile so the page stays put.
  const last = useRef<PoemBundle | undefined>(undefined);
  if (data) last.current = data;
  const bundle = data ?? (last.current?.poem.id === id ? last.current : undefined);
  if (!bundle) return <StateView error={error} onRetry={retry} />;
  const recitation = bundle.recitations[0];
  if (!recitation) return <StateView error={new Error("no recitation")} />;
  const validBayt = bayt && bundle.poem.abyat.some((b) => b.n === bayt) ? bayt : undefined;
  const layout = wide ? "wide" : "compact";
  return (
    <ListeningProvider bundle={bundle} recitation={recitation} layout={layout} initialBayt={validBayt}>
      <SpaceKey />
      {layout === "wide" ? <WideLayout /> : <CompactLayout />}
    </ListeningProvider>
  );
}

/** On the web, space plays and pauses this poem. Media keys are the player's own (expo-audio). */
function SpaceKey() {
  const { playback } = useListening();
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.code !== "Space" || e.repeat || el?.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      playback.toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playback]);
  return null;
}
