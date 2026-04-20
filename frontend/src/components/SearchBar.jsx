/**
 * SearchBar — Prominent ticker search + "Analyze Target" button.
 */
import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading = false }) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = ticker.trim().toUpperCase();
    if (cleaned && !isLoading) {
      onSearch(cleaned);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div
        className="flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)]
                    bg-[var(--bg-card)] p-1.5 shadow-lg shadow-black/20
                    focus-within:border-[var(--accent-indigo)] focus-within:shadow-[0_0_0_3px_var(--glow-indigo)]
                    transition-all duration-300"
      >
        {/* Search icon */}
        <div className="pl-3 text-[var(--text-muted)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          id="ticker-search"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter ticker symbol (e.g. AAPL)"
          className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)]
                     text-sm font-medium outline-none py-2.5 px-1
                     font-['JetBrains_Mono',monospace] tracking-wider uppercase"
          autoComplete="off"
          disabled={isLoading}
        />

        {/* Button */}
        <button
          id="analyze-button"
          type="submit"
          disabled={isLoading || !ticker.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-indigo-600 to-indigo-500
                     text-white shadow-md shadow-indigo-500/20
                     hover:from-indigo-500 hover:to-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30
                     active:scale-[0.97]
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                     transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analyze Target
            </>
          )}
        </button>
      </div>
    </form>
  );
}
