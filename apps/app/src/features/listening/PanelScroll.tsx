import { space } from "@shawared/design";
import { createContext, use, useCallback, useRef, type ReactNode } from "react";
import { ScrollView, type HostInstance, type ScrollViewInstance, type StyleProp, type ViewStyle } from "react-native";

type Reveal = (node: HostInstance | null) => void;
const RevealCtx = createContext<Reveal>(() => {});

/**
 * The scrolling box the explanation sits in (the side panel, the phone sheet). Anything
 * inside can ask to be brought into view, such as the meaning of a word just tapped.
 */
export function PanelScroll({
  style,
  contentContainerStyle,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const scroll = useRef<ScrollViewInstance>(null);
  const offset = useRef(0);
  const reveal = useCallback<Reveal>((node) => {
    const box = scroll.current as unknown as HostInstance | null;
    if (!node || !box) return;
    node.measureInWindow((_x, top, _w, height) =>
      box.measureInWindow((_bx, boxTop, _bw, boxHeight) => {
        const margin = space.xl;
        if (top >= boxTop + margin && top + height <= boxTop + boxHeight - margin) return;
        scroll.current?.scrollTo({ y: Math.max(0, offset.current + top - boxTop - margin), animated: true });
      }),
    );
  }, []);
  return (
    <RevealCtx value={reveal}>
      <ScrollView
        ref={scroll}
        style={style}
        contentContainerStyle={contentContainerStyle}
        onScroll={(e) => (offset.current = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
      >
        {children}
      </ScrollView>
    </RevealCtx>
  );
}

/** Brings a part of the explanation into view. */
export const useReveal = () => use(RevealCtx);
