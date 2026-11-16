import type { PoemBundle } from "@shawared/contracts";
import Head from "expo-router/head";
import { useEffect, useRef } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { usePoemBundle } from "../../lib/content";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { CompactLayout, WideLayout } from "./layouts";
import { usePlaying } from "./playback";
import { ListeningProvider, useCurrentBayt, useListening } from "./state";

export const WIDE_MIN = 960;

export function ListeningScreen({ id }: { id: string }) {
  const { lang } = useSettings();
  const { width } = useWindowDimensions();
  const { data, error, retry } = usePoemBundle(id, lang);
  // Switching language loads another bundle; keep the current one meanwhile so playback carries on.
  const last = useRef<PoemBundle | undefined>(undefined);
  if (data) last.current = data;
  const bundle = data ?? (last.current?.poem.id === id ? last.current : undefined);
  if (!bundle) return <StateView error={error} onRetry={retry} />;
  const recitation = bundle.recitations[0];
  if (!recitation) return <StateView error={new Error("no recitation")} />;
  const layout = width >= WIDE_MIN ? "wide" : "compact";
  return (
    <ListeningProvider bundle={bundle} recitation={recitation} layout={layout}>
      <Head>
        <title>{`${bundle.poem.title} · ${bundle.poet.name} · ${t(lang, "brand")}`}</title>
      </Head>
      <WebKeys />
      {layout === "wide" ? <WideLayout /> : <CompactLayout />}
    </ListeningProvider>
  );
}

/** Space plays and pauses; media keys and the system's now-playing panel follow the poem. */
function WebKeys() {
  const { playback, bundle, recitation, jump } = useListening();
  const playing = usePlaying(playback);
  const n = useCurrentBayt();
  const { lang } = useSettings();

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

  useEffect(() => {
    if (Platform.OS !== "web" || !("mediaSession" in navigator)) return;
    const reciter = bundle.reciters[recitation.reciter]?.name ?? "";
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${bundle.poem.title} · ${t(lang, "verse", { n })}`,
      artist: `${bundle.poet.name} · ${reciter}`,
      album: t(lang, "brand"),
    });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [bundle, recitation, n, lang, playing]);

  useEffect(() => {
    if (Platform.OS !== "web" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const set = (a: MediaSessionAction, h: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(a, h);
      } catch {}
    };
    set("play", () => playback.play());
    set("pause", () => playback.pause());
    set("seekto", (d) => d.seekTime !== undefined && jump(d.seekTime));
    return () => ["play", "pause", "seekto"].forEach((a) => set(a as MediaSessionAction, null));
  }, [playback, jump]);
  return null;
}
