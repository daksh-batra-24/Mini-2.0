import { useState } from 'react';

const QUICK_TICKERS = ['NVDA', 'TSLA', 'BTC', 'RELIANCE.NS'];

const S = {
  font: '"Times New Roman", Times, serif',
  navy: '#0B1D3A',
  gold: '#C5A028',
  ivory: '#FDFBF7',
  surface: '#F3F1EB',
  muted: '#7A8EA8',
  border: 'rgba(11,29,58,0.30)',
};

export default function SearchBar({ onSearch, isLoading }) {
  const [ticker, setTicker] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) onSearch(ticker.trim().toUpperCase());
  };

  return (
    <div style={{ width: '100%', maxWidth: 640, fontFamily: S.font }} className="animate-fade-in-up">

      {/* Eyebrow */}
      <p className="label-xs text-center" style={{ marginBottom: 16, letterSpacing: '0.25em' }}>
        Topological Risk Analysis Engine
      </p>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            border: `1px solid ${focused ? S.navy : S.border}`,
            background: S.ivory,
            transition: 'border-color 0.15s ease',
          }}
        >
          {/* Search icon */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 14, flexShrink: 0, color: S.muted }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Symbol — BTC, NVDA, RELIANCE.NS…"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '14px 12px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: S.font,
              color: S.navy,
              letterSpacing: '0.04em',
            }}
          />

          {/* Ingest button */}
          <button
            type="submit"
            disabled={isLoading || !ticker.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 22px',
              background: (isLoading || !ticker.trim()) ? S.surface : S.gold,
              color: (isLoading || !ticker.trim()) ? S.muted : S.ivory,
              border: 'none',
              borderLeft: `1px solid ${S.border}`,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: S.font,
              cursor: (isLoading || !ticker.trim()) ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
              flexShrink: 0,
            }}
          >
            {isLoading ? (
              /* Minimalist navy spinner — no glow */
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={S.navy} strokeWidth="2"
                style={{ animation: 'spin-cw 0.9s linear infinite' }}
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : (
              <>
                Ingest
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick links */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <span className="label-xs" style={{ letterSpacing: '0.22em' }}>Quick</span>
        <span style={{ width: 20, height: 1, background: S.border }} />
        {QUICK_TICKERS.map((t, i) => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setTicker(t); onSearch(t); }}
              disabled={isLoading}
              style={{
                fontFamily: S.font, fontSize: 11, fontWeight: 600,
                color: S.muted, background: 'none', border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                transition: 'color 0.15s',
                opacity: isLoading ? 0.4 : 1,
              }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.color = S.navy; }}
              onMouseLeave={(e) => { e.target.style.color = S.muted; }}
            >
              {t}
            </button>
            {i < QUICK_TICKERS.length - 1 && (
              <span style={{ color: S.border, fontSize: 12 }}>·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
