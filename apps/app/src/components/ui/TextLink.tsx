import { Link } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

/**
 * A link that is its text: it takes the width of what it says, never its container's, in a
 * column, a row or a centred box alike. (Rows and cards are links of their own, tapped anywhere.)
 */
export function TextLink({
  href,
  children,
  style,
  current,
}: {
  href: string;
  children: ReactNode;
  /** For the link itself: how its texts sit (gap, alignment). */
  style?: StyleProp<ViewStyle>;
  /** The page it leads to is the one open. */
  current?: boolean;
}) {
  return (
    // A row hugs its children: the link inside gets its text's width wherever the row sits.
    <View style={styles.line}>
      <Link href={href} asChild>
        <Pressable
          accessibilityRole="link"
          aria-current={current ? "page" : undefined}
          // Link asChild needs one flat style object.
          style={StyleSheet.flatten([styles.link, style])}
        >
          {children}
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: "row", flexShrink: 1, minWidth: 0 },
  link: { flexShrink: 1, minWidth: 0 },
});
