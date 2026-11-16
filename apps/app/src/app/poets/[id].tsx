import { useLocalSearchParams } from "expo-router";
import { PoetScreen } from "../../features/poets/PoetScreen";

export default function PoetRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PoetScreen id={id} />;
}
