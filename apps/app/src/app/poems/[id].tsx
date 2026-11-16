import { useLocalSearchParams } from "expo-router";
import { ListeningScreen } from "../../features/listening/ListeningScreen";

export default function PoemRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ListeningScreen key={id} id={id} />;
}
