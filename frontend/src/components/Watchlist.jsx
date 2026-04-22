/**
 * Watchlist — Persistent sidebar panel for saved tickers.
 */

function getRiskColor(riskLevel) {
  if (!riskLevel) return 'var(--text-muted)';
  const l = riskLevel.toLowerCase();
  if (l.includes('high')) return 'var(--accent-neon-orange)';
  if (l.includes('medium')) return 'var(--accent-neon-yellow)';
  return 'var(--accent-neon-green)';
}

export function WatchlistPanel({ watchlist, onSelect, onRemove }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Watchlist
        </span>
        <span className="text-[10px] font-bold text-[var(--text-muted)]">{watchlist.length}/10</span>
      </div>

      {watchlist.length === 0 ? (
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed py-2">
          Search a ticker and pin it here for quick access.
        </p>
      ) : (
        watchlist.map(item => (
          <button
            key={item.ticker}
            onClick={() => onSelect(item.ticker)}
            className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-all text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-neon-pulse"
                style={{ backgroundColor: getRiskColor(item.riskLevel), boxShadow: `0 0 6px ${getRiskColor(item.riskLevel)}` }}
              />
              <span className="font-bold text-white text-xs truncate">{item.ticker}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.score !== undefined && (
                <span
                  className="text-xs font-black font-jetbrains"
                  style={{ color: getRiskColor(item.riskLevel) }}
                >
                  {item.score}
                </span>
              )}
              <span
                onClick={(e) => { e.stopPropagation(); onRemove(item.ticker); }}
                className="text-[var(--text-muted)] hover:text-white transition-colors text-sm leading-none opacity-0 group-hover:opacity-100"
              >
                ×
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

export function HistoryPanel({ history, onSelect }) {
  if (!history.length) return null;
  return (
    <div className="flex flex-col gap-1 mt-6">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3">
        Recent
      </span>
      {history.slice(0, 6).map(item => (
        <button
          key={item.ticker + item.timestamp}
          onClick={() => onSelect(item.ticker)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors text-left"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{item.ticker}</span>
            <span className="text-[10px] text-[var(--text-muted)]">
              ${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div
            className="text-[10px] font-black font-jetbrains flex-shrink-0"
            style={{ color: getRiskColor(item.riskLevel) }}
          >
            {item.score}
          </div>
        </button>
      ))}
    </div>
  );
}
