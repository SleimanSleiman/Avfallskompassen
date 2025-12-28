import { useLayoutHistory } from "./UseLayoutHistory";
import type { LayoutSnapshot } from "../lib/Types";

export function usePlanningLayout(initial: LayoutSnapshot) {
  return useLayoutHistory<LayoutSnapshot>(initial);
}