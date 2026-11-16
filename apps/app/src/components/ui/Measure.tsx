import { withKashida } from "@shawared/contracts";
import { space } from "@shawared/design";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { ARABIC } from "../../lib/align";

// Every half of a poem shares one width, its measure (docs/typography.md, "Verses at one
// width"): the half's kashida is shown and its words are spread across the measure.

type Plan = readonly (readonly [number, number])[] | undefined;

/**
 * A half's words laid across the measure, `size` being their font size. Without a measure,
 * the words as they are. A box too narrow for the measure wraps them instead.
 */
export function Measure({ measure, size, children }: { measure: number | undefined; size: number; children: ReactNode }) {
  if (measure === undefined) return <>{children}</>;
  return <View style={[styles.measure, { width: measure * size, columnGap: size * 0.2 }]}>{children}</View>;
}

/** A half's words as shown: with its kashida. Their order and count are the text's. */
export const shownWords = (text: string, kashida: Plan) => withKashida(text, kashida).split(" ");

/**
 * One half of a bayt on its own line, in a right-to-left box: the sadr at the start, the
 * ajuz at the end. `indent` keeps it off the other side, so the two halves step.
 */
export function Half({
  text,
  kashida,
  measure,
  style,
  side,
  indent,
}: {
  text: string;
  kashida: Plan;
  measure: number | undefined;
  /** A verse role and its colour. */
  style: StyleProp<TextStyle>;
  side: "start" | "end";
  indent: `${number}%`;
}) {
  const size = StyleSheet.flatten(style)?.fontSize ?? 17;
  const line: ViewStyle =
    side === "start" ? { justifyContent: "flex-start", paddingEnd: indent } : { justifyContent: "flex-end", paddingStart: indent };
  if (measure === undefined)
    return (
      <Text
        style={[style, side === "start" ? styles.start : styles.end, side === "start" ? { paddingEnd: indent } : { paddingStart: indent }]}
      >
        {text}
      </Text>
    );
  return (
    <View style={[styles.line, line]}>
      <Measure measure={measure} size={size}>
        {shownWords(text, kashida).map((w, i) => (
          <Text key={i} style={style}>
            {w}
          </Text>
        ))}
      </Measure>
    </View>
  );
}

const styles = StyleSheet.create({
  measure: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", maxWidth: "100%", rowGap: space.xs },
  line: { flexDirection: "row" },
  start: { textAlign: ARABIC.start },
  end: { textAlign: ARABIC.end },
});
