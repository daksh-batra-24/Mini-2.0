const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const IVORY = '#FDFBF7';
const FONT  = '"Times New Roman", Times, serif';

function riskPalette(riskLevel) {
  if (!riskLevel) return { color: '#7A8EA8', label: 'Analysis Complete' };
  const l = riskLevel.toLowerCase();
  if (l.includes('high'))   return { color: '#7A1515', label: 'Critical Condition' };
  if (l.includes('medium')) return { color: GOLD,      label: 'Pre-Shatter Warning' };
  return                           { color: '#1A5C2E', label: 'Operational Integrity' };
}

export default function RecommendationAlert({
  riskLevel,
  recommendation,
  currentPrice,
  features = {},
}) {
  const palette = riskPalette(riskLevel);

  const atr          = features?.ATR || 0;
  const stopLoss     = atr > 0 ? currentPrice - atr * 2 : null;
  const stopLossPct  = atr > 0 ? ((atr * 2) / currentPrice * 100).toFixed(2) : '2.50';
  const positionPct  = atr > 0
    ? Math.min(100, 1 / parseFloat(stopLossPct) * 100).toFixed(1)
    : null;

  const rsi       = features?.RSI;
  const rsiLabel  = rsi != null
    ? rsi > 70 ? `Overbought — RSI ${rsi.toFixed(0)}, momentum exhaustion`
    : rsi < 30 ? `Oversold — RSI ${rsi.toFixed(0)}, potential reversal zone`
    : `Neutral momentum — RSI ${rsi.toFixed(0)}`
    : null;

  const bbPivot = features?.BB_Pivot;
  const bbLabel = bbPivot != null
    ? bbPivot > 0.8 ? 'Near Upper Band'
    : bbPivot < 0.2 ? 'Near Lower Band'
    : 'Mid-Band'
    : 'N/A';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>

      {/* ── Price + Risk Badge ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingBottom: 20, borderBottom: '1px solid rgba(11,29,58,0.10)',
        }}
      >
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 6 }}>
            Live Valuation
          </p>
          <p style={{ fontSize: 44, fontWeight: 900, color: NAVY, lineHeight: 1 }}>
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {rsiLabel && (
            <p style={{ fontSize: 11, color: '#3D5275', marginTop: 6 }}>{rsiLabel}</p>
          )}
        </div>

        <div
          style={{
            padding: '8px 18px',
            border: `1px solid ${palette.color}`,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: palette.color, fontFamily: FONT, flexShrink: 0,
          }}
        >
          {riskLevel}
        </div>
      </div>

      {/* ── Verdict card ──────────────────────────────────────────── */}
      <div
        style={{
          background: '#F3F1EB',
          border: `1px solid rgba(11,29,58,0.15)`,
          padding: '18px 20px 18px 24px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Left accent — 3px navy-adjacent rule in risk color */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: 3, background: palette.color,
          }}
        />
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: palette.color, marginBottom: 6 }}>
          {palette.label}
        </p>
        <h3 style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: NAVY, marginBottom: 8 }}>
          System Recommendation
        </h3>
        <p style={{ fontSize: 13, lineHeight: 1.75, color: '#3D5275' }}>
          {recommendation}
        </p>
      </div>

      {/* ── Execution Metrics Grid ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'rgba(11,29,58,0.15)' }}>
        {[
          {
            label: 'Stop-Loss',
            value: stopLoss != null
              ? `$${stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'N/A',
            sub: `−${stopLossPct}% · 2× ATR`,
          },
          {
            label: 'ATR 14D',
            value: atr > 0 ? `$${atr.toFixed(2)}` : 'N/A',
            sub: 'Avg True Range',
          },
          {
            label: 'Position Size',
            value: positionPct ? `${positionPct}%` : 'N/A',
            sub: '1% Risk Rule',
          },
          {
            label: 'BB Position',
            value: bbPivot != null ? `${(bbPivot * 100).toFixed(1)}%` : 'N/A',
            sub: bbLabel,
          },
        ].map(tile => (
          <MetricTile key={tile.label} {...tile} />
        ))}
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub }) {
  return (
    <div
      style={{
        background: IVORY,
        padding: '14px 18px',
        display: 'flex', flexDirection: 'column', gap: 4,
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: '#7A8EA8' }}>
        {label}
      </p>
      <p style={{ fontSize: 16, fontWeight: 900, color: NAVY }}>
        {value}
      </p>
      <p style={{ fontSize: 10, color: '#7A8EA8' }}>
        {sub}
      </p>
    </div>
  );
}
