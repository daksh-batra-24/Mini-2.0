/**
 * RecommendationAlert — System verdict with ATR-based risk metrics.
 */
export default function RecommendationAlert({
  riskLevel,
  recommendation,
  ticker,
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

  // ATR-based stop loss (2x ATR below current price)
  const atr = features?.ATR || 0;
  const stopLossPrice = atr > 0 ? (currentPrice - atr * 2.0) : null;
  const stopLossPct = atr > 0 ? ((atr * 2.0) / currentPrice * 100).toFixed(2) : '2.50';

  // Position sizing: risk 1% of portfolio per trade (Kelly-lite)
  const positionPct = atr > 0
    ? Math.min(100, (1 / parseFloat(stopLossPct) * 100)).toFixed(1)
    : null;

  // RSI-based context label
  const rsi = features?.RSI;
  const rsiContext = rsi != null
    ? rsi > 70 ? `Overbought (RSI ${rsi.toFixed(0)}) — momentum exhaustion`
    : rsi < 30 ? `Oversold (RSI ${rsi.toFixed(0)}) — potential reversal zone`
    : `Neutral momentum (RSI ${rsi.toFixed(0)})`
    : null;

  const bbPivot = features?.BB_Pivot;
  const bbLabel = bbPivot != null
    ? bbPivot > 0.8 ? 'Near Upper Band'
    : bbPivot < 0.2 ? 'Near Lower Band'
    : 'Mid-Band'
    : 'N/A';

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Price + Risk Level header */}
      <div className="flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--text-muted)] mb-3">Live Valuation</p>
          <p className="text-5xl font-black text-white font-outfit tracking-tighter">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {rsiContext && (
            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">{rsiContext}</p>
          )}
        </div>
        <div
          className="px-6 py-3 rounded-xl border-2 font-black text-sm uppercase tracking-widest"
          style={{ borderColor: theme.color, color: theme.color, boxShadow: `0 0 25px ${theme.hex}22` }}
        >
          {riskLevel}
        </div>
      </div>

      {/* Verdict card */}
      <div className="bg-[var(--bg-surface)] rounded-3xl p-8 border border-white/5 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-1.5 h-full"
          style={{ backgroundColor: theme.color, boxShadow: `0 0 20px ${theme.hex}` }}
        />
        <div className="flex flex-col gap-3 pl-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{theme.label}</span>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-outfit">
            System Recommendation
          </h3>
          <p className="text-base leading-relaxed text-[var(--text-secondary)] font-medium">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Execution metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricTile
          label="Stop-Loss"
          value={stopLossPrice != null
            ? `$${stopLossPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'N/A'}
          sub={`−${stopLossPct}% (2× ATR)`}
        />
        <MetricTile
          label="ATR (14D)"
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
    <div className="p-5 rounded-2xl border border-white/5 bg-black/40 hover:bg-black/60 transition-colors flex flex-col gap-1.5">
      <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">{label}</p>
      <p className="text-sm font-black text-white font-jetbrains">{value}</p>
      <p className="text-[9px] text-[var(--text-muted)]">{sub}</p>
    </div>
  );
}
