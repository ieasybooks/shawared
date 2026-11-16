import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, PanResponder, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSettings } from "../../lib/settings";

const native = Platform.OS !== "web";

/** A panel that slides up from below. Drag its grip down, or call onClose, to put it away. */
export function Sheet({
  open,
  onClose,
  style,
  children,
  grip,
}: {
  open: boolean;
  onClose: () => void;
  style: StyleProp<ViewStyle>;
  children: ReactNode;
  grip?: ReactNode;
}) {
  const { palette } = useSettings();
  const [height, setHeight] = useState(800);
  const shown = useRef(new Animated.Value(open ? 1 : 0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (open) setMounted(true);
    drag.setValue(0);
    Animated.timing(shown, {
      toValue: open ? 1 : 0,
      duration: 340,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: native,
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, shown, drag]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60 || g.vy > 0.8) onCloseRef.current();
        else Animated.spring(drag, { toValue: 0, useNativeDriver: native }).start();
      },
    }),
  ).current;

  const translateY = Animated.add(shown.interpolate({ inputRange: [0, 1], outputRange: [height + 40, 0] }), drag);
  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={[
        styles.sheet,
        { backgroundColor: palette.raise, shadowColor: palette.shadow, transform: [{ translateY }] },
        !mounted && styles.hidden,
        style,
      ]}
    >
      <View {...pan.panHandlers} style={styles.gripArea}>
        {grip ?? <View style={[styles.grip, { backgroundColor: palette.line2 }]} />}
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 16,
  },
  hidden: { opacity: 0 },
  gripArea: { paddingTop: 8, paddingBottom: 6, alignItems: "center" },
  grip: { width: 38, height: 4, borderRadius: 2 },
});
