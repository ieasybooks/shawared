import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";

// Three bars beside whatever is playing. They move only while it plays: a state, not decoration.
// On the web the browser animates them (CSS, off the main thread's work); on the apps the native
// driver does.

const web = Platform.OS === "web";
const SHAPES = [0.55, 1, 0.7] as const;

// CSS strings: React Native Web drops a transform written as a list inside keyframes, leaving
// them empty and the bars still.
const keyframes = [{ "0%": { transform: "scaleY(0.3)" }, "50%": { transform: "scaleY(1)" }, "100%": { transform: "scaleY(0.55)" } }];
const moving = web
  ? StyleSheet.create(
      Object.fromEntries(
        [0, 1, 2].map((i) => [
          `b${i}`,
          {
            animationKeyframes: keyframes,
            animationDuration: "900ms",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationDelay: `${-300 * i}ms`,
          } as object,
        ]),
      ) as Record<string, object>,
    )
  : null;

const reducedOnWeb = () => web && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Eq({ on, color, height = 12 }: { on: boolean; color: string; height?: number }) {
  if (web) {
    const still = !on || reducedOnWeb();
    return (
      <View style={[styles.eq, { height }]}>
        {SHAPES.map((k, i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: color }, still ? { transform: [{ scaleY: on ? 0.7 : k * 0.5 }] } : moving![`b${i}`]]}
          />
        ))}
      </View>
    );
  }
  return <NativeEq on={on} color={color} height={height} />;
}

function NativeEq({ on, color, height }: { on: boolean; color: string; height: number }) {
  const bars = useRef(SHAPES.map((k) => new Animated.Value(k * 0.5))).current;
  useEffect(() => {
    if (!on) {
      bars.forEach((b, i) => b.setValue(SHAPES[i]! * 0.5));
      return;
    }
    let loops: Animated.CompositeAnimation[] = [];
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        bars.forEach((b) => b.setValue(0.7));
        return;
      }
      loops = bars.map((b, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 150),
            Animated.timing(b, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(b, { toValue: 0.3, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ),
      );
      loops.forEach((l) => l.start());
    });
    return () => {
      cancelled = true;
      loops.forEach((l) => l.stop());
    };
  }, [on, bars]);
  return (
    <View style={[styles.eq, { height }]}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: b }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eq: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 2, height: "100%", borderRadius: 1, transformOrigin: "bottom" },
});
