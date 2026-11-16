import type { ComponentProps } from "react";
import { Platform, View } from "react-native";

type Props = ComponentProps<typeof View> & { dir: "rtl" | "ltr"; lang?: string };

/**
 * A box with its own reading direction. React Native Web reads the `dir`
 * attribute to resolve start/end; native layout reads the `direction` style.
 */
export function Dir({ dir, lang, style, ...rest }: Props) {
  if (Platform.OS === "web") {
    const webProps = { dir, ...(lang ? { lang } : {}) } as object;
    return <View {...rest} {...webProps} style={style} />;
  }
  return <View {...rest} style={[{ direction: dir }, style]} />;
}
