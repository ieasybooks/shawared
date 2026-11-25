import { StyleSheet } from "react-native";

export type ListEdges = { first?: boolean; last?: boolean };

// Rules and row padding separate neighbours. The header owns the opening gap and
// ListPage's footer owns the closing gap, so neither is added a second time here.
export const listEdges = StyleSheet.create({
  first: { borderTopWidth: 0, paddingTop: 0 },
  last: { paddingBottom: 0 },
});
