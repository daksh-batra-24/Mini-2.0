/**
 * RiskGauge — Circular SVG gauge displaying the Hidden Risk Score (0–100).
 * Color-coded: Green (<40), Yellow (40–70), Red (>70).
 */
export default function RiskGauge({ score = 0 }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (s) => {
    if (s > 70) return { stroke: '#ef4444', label: 'HIGH', bg: 'rgba(239,68,68,0.08)' };
    if (s >= 40) return { stroke: '#f59e0b', label: 'MEDIUM', bg: 'rgba(245,158,11,0.08)' };
    return { stroke: '#10b981', label: 'LOW', bg: 'rgba(16,185,129,0.08)' };
  };

  const { stroke, label, bg } = getColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{
          width: 180,
          height: 180,
          background: bg,
          borderRadius: '50%',
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Filled arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-gauge"
            style={{ filter: `drop-shadow(0 0 6px ${stroke})` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-extrabold tabular-nums"
            style={{ color: stroke }}
          >
            {score}
          </span>
          <span className="text-xs font-semibold tracking-widest mt-0.5" style={{ color: stroke }}>
            {label}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-[var(--text-secondary)]">
        Hidden Risk Score
      </span>
    </div>
  );
}
