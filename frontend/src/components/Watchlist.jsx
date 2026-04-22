function getRiskColor(riskLevel) {
  if (!riskLevel) return 'var(--text-muted)';
  const l = riskLevel.toLowerCase();
  if (l.includes('high')) return 'var(--accent-neon-orange)';
  if (l.includes('medium')) return 'var(--accent-neon-yellow)';
  return 'var(--accent-neon-green)';
}

export function WatchlistPanel({ watchlist, onSelect, onRemove }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="label-xs tracking-[0.2em]">Watchlist</span>
        <span className="label-xs">{watchlist.length}/10</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center py-6 gap-2 text-center">
          <svg className="w-5 h-5 opacity-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Search a ticker and pin it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {watchlist.map(item => (
            <button
              key={item.ticker}
              onClick={() => onSelect(item.ticker)}
              className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-neon-pulse"
                  style={{
                    backgroundColor: getRiskColor(item.riskLevel),
                    boxShadow: `0 0 5px ${getRiskColor(item.riskLevel)}`,
                  }}
                />
                <span className="text-[12px] font-semibold text-white truncate">{item.ticker}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.score !== undefined && (
                  <span
                    className="text-[11px] font-black font-jetbrains"
                    style={{ color: getRiskColor(item.riskLevel) }}
                  >
                    {item.score}
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(item.ticker); }}
                  className="text-[var(--text-muted)] hover:text-white transition-colors opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center"
                  aria-label={`Remove ${item.ticker}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HistoryPanel({ history, onSelect }) {
  if (!history.length) return null;
  return (
    <div className="flex flex-col mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <span className="label-xs tracking-[0.2em] mb-3">Recent</span>
      <div className="flex flex-col gap-0.5">
        {history.slice(0, 6).map(item => (
          <button
            key={item.ticker + item.timestamp}
            onClick={() => onSelect(item.ticker)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left"
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-semibold text-white truncate">{item.ticker}</span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                ${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span
              className="text-[11px] font-black font-jetbrains flex-shrink-0"
              style={{ color: getRiskColor(item.riskLevel) }}
            >
              {item.score}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
