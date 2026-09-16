import { useEffect, useRef } from "react";

// ease-out-expo
const ease = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts up to `value` by writing straight to the DOM node.
 *
 * The earlier version held the number in React state, so every one of the
 * ~84 frames re-rendered the whole dashboard and all of its habit cards.
 * Writing through a ref keeps React out of the animation loop entirely:
 * this component renders once and never again.
 */
export default function CountUp({ value = 0, duration = 1200, className }) {
  const node = useRef(null);
  const from = useRef(0);

  useEffect(() => {
    const el = node.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      from.current = value;
      el.textContent = value;
      return;
    }

    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;

    let raf = 0;

    function step(now) {
      const t = Math.min(1, (now - start) / duration);

      el.textContent = Math.round(origin + delta * ease(t));

      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        from.current = value;
      }
    }

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span ref={node} className={className}>
      0
    </span>
  );
}
