import { useEffect } from "react";
import { usePointerScene } from "../hooks/useTilt";

/**
 * Decides whether this machine should run the full effect set.
 *
 * Lite mode drops the orbs and the grid plane and freezes the ring
 * rotation, which is most of the always-on compositing work.
 */
function pickEffectMode() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency || 8;
  const narrow = window.innerWidth < 760;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;

  return coarse || reduced || narrow || cores <= 4 || lowMemory
    ? "lite"
    : "full";
}

/**
 * The room the app sits in.
 *
 * The gradients and the grid plane are painted once into this fixed
 * layer and then left alone. Only the two orbs animate, and they animate
 * translate3d only, so they are rasterised once and moved by the
 * compositor after that.
 */
export default function AmbientField() {
  const track = usePointerScene();

  useEffect(() => {
    document.documentElement.dataset.fx = pickEffectMode();
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.fx === "lite") return;

    window.addEventListener("pointermove", track, { passive: true });
    return () => window.removeEventListener("pointermove", track);
  }, [track]);

  return (
    <div className="ambient" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="ambient-grid" />
    </div>
  );
}
