export default function RiskGauge({ score }) {
  const r = 42;
  const circumference = r * 2 * Math.PI;
  const dashOffset = circumference - (score / 100) * circumference;

  const getNeonColor = () => {
    if (score < 40) return 'var(--accent-neon-green)';
    if (score < 70) return 'var(--accent-neon-yellow)';
    return 'var(--accent-neon-orange)';
  };

  const getHex = () => {
    if (score < 40) return '#00ff88';
    if (score < 70) return '#ffdd00';
    return '#ff5500';
  };

  const getLabel = () => {
    if (score < 40) return 'SAFE';
    if (score < 70) return 'VOLATILE';
    return 'IMMINENT';
  };

  const color = getNeonColor();
  const hex = getHex();

  /* Tick marks at 0, 40, 70, 100 — mapped to angle (full circle, starting top -90deg) */
  const thresholds = [0, 40, 70, 100];
  const ticks = thresholds.map((pct) => {
    const angle = (pct / 100) * 360 - 90; // -90 so 0 starts at top
    const rad = (angle * Math.PI) / 180;
    const innerR = 48;
    const outerR = 51;
    return {
      x1: 50 + innerR * Math.cos(rad),
      y1: 50 + innerR * Math.sin(rad),
      x2: 50 + outerR * Math.cos(rad),
      y2: 50 + outerR * Math.sin(rad),
    };
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <filter id="gaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer decorative ring */}
          <circle cx="50" cy="50" r="49" stroke="#0d0d0d" strokeWidth="1" fill="none" />

          {/* Track */}
          <circle cx="50" cy="50" r={r} stroke="#181818" strokeWidth="7" fill="none" />

          {/* Active arc */}
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke={hex}
            strokeWidth="7"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Threshold tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1}
              x2={t.x2} y2={t.y2}
              stroke="#2a2a2a"
              strokeWidth="1"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Center labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <p className="label-xs mb-2 tracking-[0.25em]">Risk Score</p>
          <p className="text-6xl font-black text-white leading-none font-outfit">{score}</p>
          <div
            className="mt-3 px-3 py-0.5 rounded border text-[10px] font-black uppercase tracking-[0.18em] animate-neon-pulse"
            style={{ color, borderColor: color, boxShadow: `0 0 8px ${hex}22` }}
          >
            {getLabel()}
          </div>
        </div>
      </div>

      {/* Sub-label */}
      <p className="label-xs tracking-[0.25em] opacity-40 text-center">Manifold Shattering Coefficient</p>
    </div>
  );
}
