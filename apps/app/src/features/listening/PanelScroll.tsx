import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollView, type HostInstance, type ScrollViewInstance, type StyleProp, type ViewStyle } from "react-native";
import { isWide, useLayoutChanges } from "../../lib/responsive";
import { createPanelReveal } from "./panelReveal";
import { useSheetReady } from "./Sheet";

type Reveal = (node: HostInstance | null) => () => void;
const RevealCtx = createContext<Reveal>(() => () => {});

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
  const [reveal] = useState(() =>
    createPanelReveal(
      () => scroll.current as unknown as HostInstance | null,
      (y) => scroll.current?.scrollTo({ y, animated: true }),
    ),
  );
  const sheetReady = useSheetReady();
  const layoutChanges = useLayoutChanges();
  useEffect(() => {
    // CSS keeps the web sidebar open even while its phone sheet is closed.
    reveal.setReady(isWide() || sheetReady);
  }, [reveal, sheetReady, layoutChanges]);
  useEffect(() => () => reveal.clear(), [reveal]);
  return (
    <RevealCtx value={reveal.request}>
      <ScrollView
        ref={scroll}
        style={style}
        contentContainerStyle={contentContainerStyle}
        onLayout={reveal.layout}
        onContentSizeChange={reveal.layout}
        onScroll={(e) => reveal.scrolled(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={32}
      >
        {children}
      </ScrollView>
    </RevealCtx>
  );
}

/** Brings a part of the explanation into view. */
export const useReveal = () => use(RevealCtx);
