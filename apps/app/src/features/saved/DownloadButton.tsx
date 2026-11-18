import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { IconButton } from "../../components/ui/controls";
import { Dialog } from "../../components/ui/Dialog";
import { canDownload, cancel, download, downloadsStore, remove, scanDownloads, type Downloads } from "../../lib/downloads";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useStore } from "../../lib/store";

/** A recording's state on this device: on it, downloading (how far), or neither. */
export function useDownload(key: string | undefined): { done: boolean; progress: number | null } {
  useEffect(scanDownloads, []);
  const selectDone = useCallback((s: Downloads) => (key ? s.done[key] !== undefined : false), [key]);
  const selectProgress = useCallback((s: Downloads) => (key ? (s.active[key] ?? null) : null), [key]);
  return { done: useStore(downloadsStore, selectDone), progress: useStore(downloadsStore, selectProgress) };
}

/**
 * Downloads a poem's recording to listen to offline, and shows how far it got; once it's here, a
 * tap offers to remove it. The apps only: the web renders nothing.
 */
export function DownloadButton({
  poem,
  size = 38,
  iconSize = 21,
}: {
  /** The poem, its recording's audio key, and the languages its text comes in. */
  poem: { id: string; title: string; audio: string | undefined; langs: readonly string[] };
  size?: number;
  iconSize?: number;
}) {
  const { palette, lang } = useSettings();
  const key = poem.audio;
  const { done, progress } = useDownload(key);
  const [asking, setAsking] = useState(false);
  if (!canDownload || !key) return null;
  if (progress !== null)
    return (
      <View>
        <IconButton
          icon="close"
          label={progress >= 0 ? t(lang, "downloadingPct", { p: Math.round(progress * 100) }) : t(lang, "downloading")}
          onPress={() => cancel(key)}
          size={size}
          iconSize={iconSize * 0.7}
          color={palette.muted}
        />
        <Ring size={size} progress={progress} color={palette.accent} track={palette.line} />
      </View>
    );
  return (
    <>
      <IconButton
        icon={done ? "downloaded" : "download"}
        label={t(lang, done ? "removeDownload" : "download")}
        pressed={done}
        onPress={() => (done ? setAsking(true) : void download(poem.id, key, poem.langs))}
        size={size}
        iconSize={iconSize}
        color={done ? palette.accent : palette.muted}
      />
      <Dialog
        open={asking}
        title={t(lang, "removeDownload")}
        message={t(lang, "removeDownloadAsk", { title: poem.title })}
        confirm={t(lang, "delete")}
        onConfirm={() => remove(key)}
        onClose={() => setAsking(false)}
      />
    </>
  );
}

/** How far a download got, round the button; a quarter that turns when the size isn't known. */
function Ring({ size, progress, color, track }: { size: number; progress: number; color: string; track: string }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const shown = progress >= 0 ? progress : 0.25;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, start: 0, width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={2} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * shown} ${c}`}
        />
      </Svg>
    </View>
  );
}
