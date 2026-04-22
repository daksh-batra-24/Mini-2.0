import { useState } from 'react';

const QUICK_TICKERS = ['NVDA', 'TSLA', 'BTC', 'RELIANCE.NS'];

export default function SearchBar({ onSearch, isLoading }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) onSearch(ticker.trim().toUpperCase());
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">

      {/* Eyebrow label */}
      <p className="label-xs text-center mb-5">Topological Risk Analysis Engine</p>

      <form onSubmit={handleSubmit}>
        <div
          className="relative flex items-center rounded-2xl border transition-all duration-200"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          {/* Search icon */}
          <div className="pl-5 pr-1 flex-shrink-0 text-[var(--text-muted)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>

          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Symbol — BTC, NVDA, RELIANCE.NS…"
            className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-base font-semibold text-white placeholder:text-[var(--text-muted)] placeholder:font-normal font-outfit tracking-wide"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />

          <div className="pr-2 flex-shrink-0">
            <button
              type="submit"
              disabled={isLoading || !ticker.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-[11px] uppercase tracking-[0.15em] transition-all hover:bg-[#e8e8e8] active:scale-[0.97] disabled:opacity-20 disabled:pointer-events-none"
            >
              {isLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Ingest
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Quick links */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <span className="label-xs">Quick</span>
        <span className="w-4 h-px bg-[var(--border-subtle)]" />
        {QUICK_TICKERS.map((t, i) => (
          <button
            key={t}
            onClick={() => { setTicker(t); onSearch(t); }}
            disabled={isLoading}
            className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-white transition-colors disabled:opacity-40 px-1"
          >
            {t}
            {i < QUICK_TICKERS.length - 1 && (
              <span className="ml-2 text-[var(--text-muted)]">·</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
