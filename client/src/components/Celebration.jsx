import { useMemo } from "react";

const COLORS = ["#E8B15C", "#46D9B0", "#8A7BE8", "#FFD79A", "#E7F1F5"];

/**
 * A short 3D burst that fires once when the last habit of the day is
 * ticked. Transient by design: the parent unmounts it after ~1.9s, so
 * nothing is left animating.
 */
export default function Celebration() {
  const shards = useMemo(() => {
    if (document.documentElement.dataset.fx === "lite") return [];

    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.4;
      const reach = 170 + Math.random() * 260;

      return {
        id: i,
        tx: `${Math.round(Math.cos(angle) * reach)}px`,
        ty: `${Math.round(Math.sin(angle) * reach - 80)}px`,
        tzz: `${Math.round((Math.random() - 0.4) * 300)}px`,
        delay: `${(Math.random() * 0.2).toFixed(2)}s`,
        color: COLORS[i % COLORS.length]
      };
    });
  }, []);

  if (!shards.length) return null;

  return (
    <div className="celebrate" aria-hidden="true">
      {shards.map(s => (
        <span
          key={s.id}
          className="spark"
          style={{
            background: s.color,
            "--tx": s.tx,
            "--ty": s.ty,
            "--tzz": s.tzz,
            "--d": s.delay
          }}
        />
      ))}
    </div>
  );
}
