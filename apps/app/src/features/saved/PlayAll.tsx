import { Chip } from "../../components/ui/controls";
import { t } from "../../lib/i18n";
import { useSettings } from "../../lib/settings";
import { playList } from "./actions";

export function PlayAll({ ids }: { ids: readonly string[] }) {
  const { lang } = useSettings();
  return (
    <Chip icon="play" onPress={() => playList(ids, lang)}>
      {t(lang, "playAll")}
    </Chip>
  );
}
