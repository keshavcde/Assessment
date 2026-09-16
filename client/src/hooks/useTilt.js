import { useCallback, useRef } from "react";

/** Devices that should not run pointer-driven 3D at all. */
function tiltDisabled() {
  return (
    document.documentElement.dataset.fx === "lite" ||
    !window.matchMedia("(hover: hover)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Pointer-driven 3D tilt.
 *
 * Writes only --rx / --ry / --tz, all of which feed a single transform.
 * Transform is one of the two properties a browser can animate without
 * repainting, so tilting a card costs a composite and nothing else.
 *
 * The element's geometry is measured once on enter rather than on every
 * move, because getBoundingClientRect() forces a synchronous layout.
 */
export default function useTilt(max = 6) {
  const frame = useRef(0);
  const box = useRef(null);

  const onPointerEnter = useCallback(event => {
    if (tiltDisabled()) return;

    const el = event.currentTarget;

    box.current = el.getBoundingClientRect();
    el.classList.remove("resting");
  }, []);

  const onPointerMove = useCallback(
    event => {
      if (tiltDisabled() || !box.current) return;

      const el = event.currentTarget;
      const b = box.current;

      // one write per frame, no matter how many events arrive
      if (frame.current) return;

      const clientX = event.clientX;
      const clientY = event.clientY;

      frame.current = requestAnimationFrame(() => {
        frame.current = 0;

        const x = (clientX - b.left) / b.width - 0.5;
        const y = (clientY - b.top) / b.height - 0.5;

        el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty("--tz", "14px");
      });
    },
    [max]
  );

  const onPointerLeave = useCallback(event => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    box.current = null;

    const el = event.currentTarget;

    // longer curve on the way back out than while tracking
    el.classList.add("resting");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--tz", "0px");
  }, []);

  return { onPointerEnter, onPointerMove, onPointerLeave };
}

/**
 * Window-level parallax. Only the day dial reads --mx / --my, so this
 * restyles one small element per frame.
 */
export function usePointerScene() {
  const frame = useRef(0);

  return useCallback(event => {
    if (tiltDisabled() || frame.current) return;

    const clientX = event.clientX;
    const clientY = event.clientY;

    frame.current = requestAnimationFrame(() => {
      frame.current = 0;

      const root = document.documentElement;

      root.style.setProperty(
        "--mx",
        (clientX / window.innerWidth - 0.5).toFixed(3)
      );
      root.style.setProperty(
        "--my",
        (clientY / window.innerHeight - 0.5).toFixed(3)
      );
    });
  }, []);
}
