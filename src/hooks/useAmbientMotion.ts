import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { hasFinePointer } from "@/lib/utils";

/**
 * Whether the large blurred backdrop layers are allowed to move.
 *
 * Animating a layer that carries a `filter: blur()` forces the compositor to
 * re-run the gaussian across a buffer the size of the element on every frame.
 * Desktop GPUs absorb that; Safari on a phone does not, and this page stacks
 * several of them full-screen at once — enough to hold up the first paint and
 * leave the page stuttering afterwards. The layers still render on a
 * touchscreen, they just hold still, which costs one rasterisation instead of
 * sixty a second and is nearly impossible to notice on a phone.
 */
export function useAmbientMotion(): boolean {
  const reduceMotion = useReducedMotion();
  const [finePointer] = useState(hasFinePointer);
  return !reduceMotion && finePointer;
}
