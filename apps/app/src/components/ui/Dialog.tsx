import { space } from "@shawared/design";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { inputAlign } from "../../lib/align";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { useType } from "../../lib/type";
import { Dir } from "./Dir";
import type { PressState } from "./controls";

/**
 * A question over the page: a title, a line of explanation or a name to type, and two
 * buttons. The web's `Alert` does nothing, so the app asks with this on every platform.
 */
export function Dialog({
  open,
  title,
  message,
  input,
  confirm,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  /** A text to type, such as a playlist's name: its label and what it starts with. */
  input?: { label: string; initial: string; maxLength?: number };
  /** The confirming button's label. */
  confirm: string;
  /** With `input`, the text typed. */
  onConfirm: (text: string) => void;
  onClose: () => void;
}) {
  const { palette, lang, rtl, start } = useSettings();
  const type = useType();
  const [text, setText] = useState(input?.initial ?? "");
  useEffect(() => {
    if (open) setText(input?.initial ?? "");
  }, [open, input?.initial]);
  const submit = () => {
    onConfirm(text);
    onClose();
  };
  const { fontFamily, fontSize } = type.control;
  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        accessibilityLabel={t(lang, "close")}
        style={[StyleSheet.absoluteFill, { backgroundColor: palette.shadow }]}
        onPress={onClose}
      />
      <View pointerEvents="box-none" style={styles.center}>
        <Dir
          dir={rtl ? "rtl" : "ltr"}
          role="dialog"
          aria-modal
          aria-label={title}
          style={[styles.card, { backgroundColor: palette.raise, borderColor: palette.line, shadowColor: palette.shadow }]}
        >
          <Text accessibilityRole="header" style={[type.heading, { color: palette.fg, textAlign: start }]}>
            {title}
          </Text>
          {message && <Text style={[type.body, { color: palette.muted, textAlign: start }]}>{message}</Text>}
          {input && (
            <TextInput
              value={text}
              onChangeText={setText}
              autoFocus
              maxLength={input.maxLength}
              placeholder={input.label}
              placeholderTextColor={palette.muted}
              accessibilityLabel={input.label}
              returnKeyType="done"
              onSubmitEditing={submit}
              style={[
                styles.input,
                { fontFamily, fontSize, color: palette.fg, borderColor: palette.line, textAlign: inputAlign(rtl ? "rtl" : "ltr") },
              ]}
            />
          )}
          <View style={styles.buttons}>
            <DialogButton label={t(lang, "cancel")} onPress={onClose} />
            <DialogButton label={confirm} onPress={submit} strong />
          </View>
        </Dir>
      </View>
    </Modal>
  );
}

function DialogButton({ label, onPress, strong }: { label: string; onPress: () => void; strong?: boolean }) {
  const { palette } = useSettings();
  const type = useType();
  const fill = strong ? palette.fg : "transparent";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={(s: PressState) => [
        styles.button,
        { backgroundColor: fill, borderColor: strong ? fill : palette.line },
        !strong && (s.hovered || s.pressed) && { backgroundColor: palette.fold },
      ]}
    >
      <Text style={[strong ? type.controlStrong : type.control, { color: strong ? palette.bg : palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.xl },
  card: {
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 18,
    padding: space.xl,
    gap: space.l,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 12,
  },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: space.l, paddingVertical: space.m, outlineStyle: "none" } as object,
  buttons: { flexDirection: "row", justifyContent: "flex-end", gap: space.s, paddingTop: space.xs },
  button: { minHeight: 40, justifyContent: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: space.l },
});
