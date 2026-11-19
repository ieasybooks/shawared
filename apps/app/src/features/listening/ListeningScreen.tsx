import type { PoemBundle } from "@shawared/contracts";
import { router, useNavigation } from "expo-router";
import { CommonActions } from "expo-router/react-navigation";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { StateView } from "../../components/ui/StateView";
import { PageFrame } from "../library/Page";
import { usePoemBundle } from "../../lib/content";
import { paths } from "../../lib/routes";
import { useSettings } from "../../lib/settings";
import { player } from "../player/player";
import { ListeningLayout } from "./layouts";
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
  return (
    <ListeningProvider bundle={bundle} recitation={recitation} initialBayt={validBayt}>
      <SpaceKey />
      <FollowQueue id={id} />
      <ListeningLayout />
    </ListeningProvider>
  );
}

/** How many poems the queue moved on from stay behind the one in front, for back to return to. */
const KEEP_BEHIND = 5;

type StackRoute = { name: string; params?: object | undefined };
const isPoem = (r: StackRoute | undefined): r is StackRoute => !!r && r.name.endsWith("poems/[id]");
const poemOf = (r: StackRoute) => (r.params as { id?: string } | undefined)?.id;

/**
 * When the queue moves on from this poem (it ended, or the lock screen, a headset or a media key
 * skipped it) while its page is in front, the page moves on with it: the next poem opens as a page
 * of its own, so back returns here, without playing this poem. When the queue goes back to the
 * poem whose page is beneath, the page goes back to it. Only the last KEEP_BEHIND poems stay.
 */
function FollowQueue({ id }: { id: string }) {
  const navigation = useNavigation();
  const { href } = useSettings();
  useEffect(() => {
    let last = player.now.get().item?.poemId;
    let followed = false;
    // Back here: this page follows the queue again.
    const offFocus = navigation.addListener("focus", () => (followed = false));
    const offNow = player.now.subscribe(() => {
      const { item, from } = player.now.get();
      const was = last;
      last = item?.poemId;
      if (followed || !item || was !== id || item.poemId === id || from !== id || !navigation.isFocused()) return;
      followed = true;
      const { routes, index } = navigation.getState() as { routes: StackRoute[]; index: number };
      const beneath = routes[index - 1];
      if (isPoem(beneath) && poemOf(beneath) === item.poemId) navigation.goBack();
      else router.push(href(paths.poem(item.poemId)));
    });
    return () => {
      offFocus();
      offNow();
    };
  }, [id, navigation, href]);

  // A page opened on top of others: keep at most KEEP_BEHIND poem pages straight beneath it.
  useEffect(() => {
    const state = navigation.getState() as { routes: StackRoute[]; index: number } | undefined;
    if (!state || !isPoem(state.routes[state.index])) return;
    let start = state.index;
    while (isPoem(state.routes[start - 1])) start--;
    const extra = state.index - start - KEEP_BEHIND;
    if (extra <= 0) return;
    const routes = [...state.routes.slice(0, start), ...state.routes.slice(start + extra)];
    navigation.dispatch(CommonActions.reset({ ...state, routes, index: state.index - extra } as never));
  }, [navigation]);
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
