export default function RecommendationAlert({
  riskLevel,
  recommendation,
  currentPrice,
  features = {},
}) {
  const isHighRisk = riskLevel?.toLowerCase().includes('high');
  const isMediumRisk = riskLevel?.toLowerCase().includes('medium');

  const getTheme = () => {
    if (isHighRisk) return { color: 'var(--accent-neon-orange)', label: 'Critical Condition', hex: '#ff5500' };
    if (isMediumRisk) return { color: 'var(--accent-neon-yellow)', label: 'Pre-Shatter Warning', hex: '#ffdd00' };
    return { color: 'var(--accent-neon-green)', label: 'Operational Integrity', hex: '#00ff88' };
  };

  const theme = getTheme();

  const atr = features?.ATR || 0;
  const stopLossPrice = atr > 0 ? currentPrice - atr * 2 : null;
  const stopLossPct = atr > 0 ? ((atr * 2) / currentPrice * 100).toFixed(2) : '2.50';
  const positionPct = atr > 0
    ? Math.min(100, 1 / parseFloat(stopLossPct) * 100).toFixed(1)
    : null;

  const rsi = features?.RSI;
  const rsiContext = rsi != null
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
    <div className="w-full flex flex-col gap-7">

      {/* Price + risk badge */}
      <div className="flex items-end justify-between">
        <div>
          <p className="label-xs mb-2">Live Valuation</p>
          <p className="text-5xl font-black text-white font-outfit tracking-tighter leading-none">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {rsiContext && (
            <p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{rsiContext}</p>
          )}
        </div>
        <div
          className="px-5 py-2.5 rounded-xl border font-bold text-[11px] uppercase tracking-widest flex-shrink-0"
          style={{ borderColor: theme.color, color: theme.color, boxShadow: `0 0 18px ${theme.hex}18` }}
        >
          {riskLevel}
        </div>
      </div>

      {/* Verdict card */}
      <div
        className="rounded-2xl p-6 border relative overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        {/* Accent strip */}
        <div
          className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
          style={{ background: theme.color, boxShadow: `0 0 16px ${theme.hex}` }}
        />
        <div className="pl-5">
          <p className="label-xs mb-1.5" style={{ color: theme.color }}>{theme.label}</p>
          <h3 className="text-base font-black text-white uppercase tracking-tight font-outfit mb-2">
            System Recommendation
          </h3>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
            {recommendation}
          </p>
        </div>
      </div>

      {/* Execution metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetricTile
          label="Stop-Loss"
          value={stopLossPrice != null
            ? `$${stopLossPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'N/A'}
          sub={`−${stopLossPct}% · 2× ATR`}
        />
        <MetricTile
          label="ATR 14D"
          value={atr > 0 ? `$${atr.toFixed(2)}` : 'N/A'}
          sub="Avg True Range"
        />
        <MetricTile
          label="Position Size"
          value={positionPct ? `${positionPct}%` : 'N/A'}
          sub="1% Risk Rule"
        />
        <MetricTile
          label="BB Position"
          value={bbPivot != null ? `${(bbPivot * 100).toFixed(1)}%` : 'N/A'}
          sub={bbLabel}
        />
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub }) {
  return (
    <div
      className="p-4 rounded-xl border flex flex-col gap-1 transition-colors group cursor-default"
      style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'var(--border-subtle)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      <p className="label-xs">{label}</p>
      <p className="text-sm font-black text-white font-jetbrains mt-0.5">{value}</p>
      <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}
