const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const FONT  = '"Times New Roman", Times, serif';

/* Risk threshold → institutional color */
function riskPalette(score) {
  if (score < 40) return { color: '#1A5C2E', label: 'SAFE' };
  if (score < 70) return { color: GOLD,      label: 'VOLATILE' };
  return               { color: '#7A1515',   label: 'IMMINENT' };
}

export default function RiskGauge({ score }) {
  const r             = 42;
  const circumference = r * 2 * Math.PI;
  const dashOffset    = circumference - (score / 100) * circumference;
  const palette       = riskPalette(score);

  /* Tick marks at threshold boundaries: 0, 40, 70, 100 */
  const ticks = [0, 40, 70, 100].map((pct) => {
    const angle = (pct / 100) * 360 - 90;
    const rad   = (angle * Math.PI) / 180;
    return {
      x1: 50 + 47 * Math.cos(rad),
      y1: 50 + 47 * Math.sin(rad),
      x2: 50 + 51 * Math.cos(rad),
      y2: 50 + 51 * Math.sin(rad),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: FONT }}>

      {/* SVG Gauge */}
      <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
          viewBox="0 0 100 100"
        >
          {/* Outer boundary ring — fine navy line */}
          <circle cx="50" cy="50" r="49" stroke={NAVY} strokeWidth="0.4" fill="none" strokeOpacity="0.2" />

          {/* Track — light navy */}
          <circle
            cx="50" cy="50" r={r}
            stroke={NAVY} strokeWidth="6"
            fill="none" strokeOpacity="0.10"
          />

          {/* Gold progress arc */}
          <circle
            cx="50" cy="50" r={r}
            stroke={GOLD}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />

          {/* Threshold tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={NAVY} strokeWidth="0.8" strokeOpacity="0.35"
            />
          ))}
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT,
          }}
        >
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 4 }}>
            Risk Score
          </p>
          <p style={{ fontSize: 54, fontWeight: 900, color: NAVY, lineHeight: 1 }}>
            {score}
          </p>
          {/* Risk label badge */}
          <div
            className="animate-neon-pulse"
            style={{
              marginTop: 8,
              padding: '2px 10px',
              border: `1px solid ${palette.color}`,
              fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: palette.color, fontFamily: FONT,
            }}
          >
            {palette.label}
          </div>
        </div>
      </div>

      {/* Sub-caption */}
      <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A8EA8', opacity: 0.7 }}>
        Manifold Shattering Coefficient
      </p>
    </div>
  );
}
