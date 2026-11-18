import type { PoemBundle } from "@shawared/contracts";
import { router, useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { PageFrame } from "../library/Page";
import { usePoemBundle } from "../../lib/content";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { player } from "../player/player";
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
  // Until the poem is here, the page already has its bar, with back.
  if (!bundle)
    return (
      <PageFrame back>
        <StateView error={error} onRetry={retry} />
      </PageFrame>
    );
  const recitation = bundle.recitations[0];
  if (!recitation) return <StateView error={new Error("no recitation")} />;
  const validBayt = bayt && bundle.poem.abyat.some((b) => b.n === bayt) ? bayt : undefined;
  const layout = wide ? "wide" : "compact";
  return (
    <ListeningProvider bundle={bundle} recitation={recitation} layout={layout} initialBayt={validBayt}>
      <SpaceKey />
      <FollowQueue id={id} />
      {layout === "wide" ? <WideLayout /> : <CompactLayout />}
    </ListeningProvider>
  );
}

/**
 * When the queue moves on from this poem (it ended, or the lock screen, a headset or a media key
 * skipped it) while its page is in front, the page moves on with it.
 */
function FollowQueue({ id }: { id: string }) {
  const navigation = useNavigation();
  const { href } = useSettings();
  useEffect(() => {
    let last = player.now.get().item?.poemId;
    let followed = false;
    return player.now.subscribe(() => {
      const { item, from } = player.now.get();
      const was = last;
      last = item?.poemId;
      if (followed || !item || was !== id || item.poemId === id || from !== id || !navigation.isFocused()) return;
      followed = true;
      router.replace(href(paths.poem(item.poemId)));
    });
  }, [id, navigation, href]);
  return null;
}

/** On the web, space plays and pauses this poem. Media keys reach the player through the Media Session (player/playlist.web.ts). */
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
