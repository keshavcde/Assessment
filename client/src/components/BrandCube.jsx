/**
 * A real six-sided cube in 3D, carrying whatever initial belongs to the
 * person using the app. Nothing here is hard-coded to one name.
 */
export function initialOf(name) {
  const clean = String(name || "").trim();
  return clean ? clean[0].toUpperCase() : "•";
}

export default function BrandCube({ name, small = false }) {
  const letter = initialOf(name);

  return (
    <div
      className={small ? "cube-stage sm" : "cube-stage"}
      aria-hidden="true"
    >
      <div className="cube">
        <span className="cube-face fr">{letter}</span>
        <span className="cube-face rt">{letter}</span>
        <span className="cube-face bk">{letter}</span>
        <span className="cube-face lf">{letter}</span>
        <span className="cube-face tp">75</span>
        <span className="cube-face bt">75</span>
      </div>
    </div>
  );
}
