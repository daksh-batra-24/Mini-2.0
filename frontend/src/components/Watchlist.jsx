const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const IVORY = '#FDFBF7';
const FONT  = '"Times New Roman", Times, serif';

function riskColor(riskLevel) {
  if (!riskLevel) return '#7A8EA8';
  const l = riskLevel.toLowerCase();
  if (l.includes('high'))   return '#7A1515';
  if (l.includes('medium')) return GOLD;
  return '#1A5C2E';
}

/* ──────────────────────────────────────────────────────────────────────── */
export function WatchlistPanel({ watchlist, onSelect, onRemove }) {
  return (
    <div style={{ fontFamily: FONT }}>
      {/* Panel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A8EA8' }}>
          Watchlist
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#7A8EA8', letterSpacing: '0.06em' }}>
          {watchlist.length}/10
        </span>
      </div>

      {/* Hairline */}
      <div style={{ height: 1, background: 'rgba(11,29,58,0.12)', marginBottom: 10 }} />

      {watchlist.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8, textAlign: 'center' }}>
          {/* Bookmark icon — navy, no glow */}
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={NAVY} strokeWidth={1.5} style={{ opacity: 0.25 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p style={{ fontSize: 10, color: '#7A8EA8', lineHeight: 1.5 }}>
            Search a ticker and pin it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {watchlist.map(item => (
            <WatchlistItem
              key={item.ticker}
              item={item}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WatchlistItem({ item, onSelect, onRemove }) {
  const color = riskColor(item.riskLevel);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 8px',
        border: '1px solid rgba(11,29,58,0.10)',
        background: IVORY,
        cursor: 'pointer',
        fontFamily: FONT,
        transition: 'border-color 0.15s ease',
      }}
      onClick={() => onSelect(item.ticker)}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(11,29,58,0.35)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(11,29,58,0.10)'}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {/* Risk dot — no glow */}
        <div
          className="animate-neon-pulse"
          style={{ width: 5, height: 5, background: color, flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.ticker}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {item.score !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 900, color }}>
            {item.score}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.ticker); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#7A8EA8', padding: 0, fontSize: 14, lineHeight: 1,
            opacity: 0, transition: 'opacity 0.15s',
          }}
          aria-label={`Remove ${item.ticker}`}
          onMouseEnter={(e) => { e.target.style.opacity = 1; e.target.style.color = NAVY; }}
          onMouseLeave={(e) => { e.target.style.opacity = 0; }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
export function HistoryPanel({ history, onSelect }) {
  if (!history.length) return null;

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(11,29,58,0.12)', fontFamily: FONT }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A8EA8', display: 'block', marginBottom: 10 }}>
        Recent
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {history.slice(0, 6).map(item => (
          <button
            key={item.ticker + item.timestamp}
            onClick={() => onSelect(item.ticker)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 8px', background: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: 'left', fontFamily: FONT,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F1EB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.ticker}
              </span>
              <span style={{ fontSize: 10, color: '#7A8EA8', marginTop: 1 }}>
                ${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 900, color: riskColor(item.riskLevel), flexShrink: 0 }}>
              {item.score}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
