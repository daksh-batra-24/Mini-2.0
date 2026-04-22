import { useState } from 'react';
import SearchBar from './components/SearchBar';
import PriceChart from './components/PriceChart';
import RiskGauge from './components/RiskGauge';
import RecommendationAlert from './components/RecommendationAlert';
import LoadingOverlay from './components/LoadingOverlay';
import FeatureRadar from './components/FeatureRadar';
import { WatchlistPanel, HistoryPanel } from './components/Watchlist';
import ResearchPage from './components/ResearchPage';
import './App.css';

const API_BASE = 'http://localhost:8000';

function generateMockPriceData(currentPrice, days = 60) {
  const data = [];
  const volatility = currentPrice * 0.012;
  let price = currentPrice * (1 - (Math.random() * 0.06 - 0.01));
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const drift = i < 5 ? (currentPrice - price) * 0.3 : 0;
    price += drift + (Math.random() - 0.48) * volatility;
    price = Math.max(price, currentPrice * 0.85);
    const c = parseFloat(price.toFixed(2));
    data.push({
      date: label,
      close: c,
      open: parseFloat((c * (1 - Math.random() * 0.004)).toFixed(2)),
      high: parseFloat((c * (1 + Math.random() * 0.007)).toFixed(2)),
      low: parseFloat((c * (1 - Math.random() * 0.007)).toFixed(2)),
    });
  }
  data[data.length - 1].close = currentPrice;
  return data;
}

function loadFromStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

const HEADER_H = 65;

export default function App() {
  const [page, setPage] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isRealData, setIsRealData] = useState(false);
  const [watchlist, setWatchlist] = useState(() => loadFromStorage('tfro_watchlist', []));
  const [predHistory, setPredHistory] = useState(() => loadFromStorage('tfro_history', []));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSearch = async (ticker) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setChartData([]);
    setIsRealData(false);

    try {
      const [predRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/predict/${encodeURIComponent(ticker)}`),
        fetch(`${API_BASE}/history/${encodeURIComponent(ticker)}`).catch(() => ({ ok: false })),
      ]);

      if (!predRes.ok) {
        const body = await predRes.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed (${predRes.status})`);
      }

      const [data, histData] = await Promise.all([
        predRes.json(),
        histRes.ok ? histRes.json() : Promise.resolve(null),
      ]);

      setResult(data);

      if (histData?.data?.length > 5) {
        setChartData(histData.data);
        setIsRealData(true);
      } else {
        setChartData(generateMockPriceData(data.current_price));
        setIsRealData(false);
      }

      const entry = {
        ticker: data.ticker,
        score: data.hidden_risk_score,
        riskLevel: data.risk_level,
        price: data.current_price,
        timestamp: new Date().toISOString(),
      };
      setPredHistory(prev => {
        const updated = [entry, ...prev.filter(h => h.ticker !== data.ticker)].slice(0, 10);
        localStorage.setItem('tfro_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err.message || 'Failed to connect to the analysis server.');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = () => {
    if (!result) return;
    const item = { ticker: result.ticker, score: result.hidden_risk_score, riskLevel: result.risk_level };
    setWatchlist(prev => {
      const updated = [item, ...prev.filter(w => w.ticker !== result.ticker)].slice(0, 10);
      localStorage.setItem('tfro_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromWatchlist = (ticker) => {
    setWatchlist(prev => {
      const updated = prev.filter(w => w.ticker !== ticker);
      localStorage.setItem('tfro_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWatchlist = result && watchlist.some(w => w.ticker === result.ticker);

  const riskColor = (level) => {
    if (!level) return 'var(--text-muted)';
    const l = level.toLowerCase();
    if (l.includes('high')) return 'var(--accent-neon-orange)';
    if (l.includes('medium')) return 'var(--accent-neon-yellow)';
    return 'var(--accent-neon-green)';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-noir" style={{ height: HEADER_H }}>
        <div className="h-full max-w-[1400px] mx-auto px-5 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.25)]">
              <div className="flex gap-0.5">
                <div className="w-[3px] h-3.5 bg-white rounded-full transform -rotate-12" />
                <div className="w-[3px] h-3.5 bg-white rounded-full transform rotate-12" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tighter uppercase font-outfit leading-none">TFRO</h1>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Risk Optimizer</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-[var(--bg-surface)] rounded-xl p-1 border border-[var(--border-subtle)]">
            {[
              { id: 'home', label: 'Dashboard' },
              { id: 'research', label: 'Research' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  page === id ? 'bg-white text-black' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-neon-green)] animate-neon-pulse shadow-[0_0_6px_var(--accent-neon-green)]" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--accent-neon-green)]">Engine Live</span>
            </div>
            {/* Mobile sidebar toggle */}
            <button
              className="lg:hidden px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white transition-colors"
              onClick={() => setMobileSidebarOpen(v => !v)}
              aria-label="Toggle watchlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside
          className={`
            flex-col w-64 flex-shrink-0 border-r border-[var(--border-subtle)] p-5 gap-0
            sticky overflow-y-auto
            lg:flex
            ${mobileSidebarOpen
              ? 'flex fixed z-40 bg-[var(--bg-primary)] w-72 shadow-2xl'
              : 'hidden'}
          `}
          style={{ top: HEADER_H, height: `calc(100vh - ${HEADER_H}px)` }}
        >
          {mobileSidebarOpen && (
            <button
              className="self-end mb-4 text-[var(--text-muted)] hover:text-white transition-colors"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <WatchlistPanel
            watchlist={watchlist}
            onSelect={(t) => { handleSearch(t); setMobileSidebarOpen(false); }}
            onRemove={removeFromWatchlist}
          />
          <HistoryPanel
            history={predHistory}
            onSelect={(t) => { handleSearch(t); setMobileSidebarOpen(false); }}
          />

          {/* Mobile nav links */}
          <div className="sm:hidden mt-auto pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            {[{ id: 'home', label: 'Dashboard' }, { id: 'research', label: 'Research' }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setPage(id); setMobileSidebarOpen(false); }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                  page === id ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Panel ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-5 lg:px-8 py-8">

          {/* ── Dashboard ────────────────────────────────────────────── */}
          {page === 'home' && (
            <div className="flex flex-col gap-10">

              <section className="flex flex-col items-center">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              </section>

              {error && (
                <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-center animate-fade-in-up">
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              {isLoading && <LoadingOverlay />}

              {result && !isLoading && (
                <div className="flex flex-col gap-8 animate-fade-in-up">

                  {/* Ticker header row */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white font-outfit tracking-tighter">{result.ticker}</span>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border"
                        style={{ color: riskColor(result.risk_level), borderColor: riskColor(result.risk_level) }}
                      >
                        {result.risk_level} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Model Certainty</p>
                        <p className="text-lg font-black font-jetbrains text-white">
                          {result.historical_accuracy_pct}<span className="text-xs text-[var(--text-muted)]">%</span>
                        </p>
                      </div>
                      <button
                        onClick={addToWatchlist}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                          isInWatchlist
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {isInWatchlist ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Watching
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Add to Watchlist
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Price chart */}
                  <PriceChart data={chartData} ticker={result.ticker} isRealData={isRealData} />

                  {/* System inference card */}
                  <div className="card-noir rounded-3xl p-8 md:p-10 flex flex-col gap-10">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-6">
                      <div>
                        <h2 className="text-xl font-black text-white tracking-tight font-outfit uppercase">
                          System Inference
                        </h2>
                        <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-widest">
                          Topological Manifold Analysis — {result.ticker}
                        </p>
                      </div>
                      <div className="text-right sm:hidden">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Certainty</p>
                        <p className="text-base font-black font-jetbrains text-white">
                          {result.historical_accuracy_pct}<span className="text-xs text-[var(--text-muted)]">%</span>
                        </p>
                      </div>
                    </div>

                    {/* Gauge + Radar */}
                    <div className="flex flex-col xl:flex-row gap-8 items-start">
                      <div className="flex-shrink-0 self-center xl:self-auto">
                        <RiskGauge score={result.hidden_risk_score} />
                      </div>
                      <div className="flex-1 w-full min-w-0">
                        <FeatureRadar
                          features={result.features || {}}
                          currentPrice={result.current_price}
                        />
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="border-t border-[var(--border-subtle)] pt-8">
                      <RecommendationAlert
                        riskLevel={result.risk_level}
                        recommendation={result.recommendation}
                        ticker={result.ticker}
                        currentPrice={result.current_price}
                        features={result.features || {}}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!result && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 rotate-3 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-8.244-4.76V7.76L12 3l8.244 4.76v8.48L12 21z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Ready for Ingestion</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed font-medium">
                    Enter a ticker to compute high-dimensional risk coefficients
                    using Topological Data Analysis and an ensemble ML model.
                  </p>
                  <button
                    onClick={() => setPage('research')}
                    className="mt-6 text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors border-b border-transparent hover:border-[var(--text-muted)] pb-0.5"
                  >
                    Learn the methodology →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Research page */}
          {page === 'research' && <ResearchPage />}

        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] py-10 mt-auto">
        <div className="max-w-[1400px] mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-black text-white italic tracking-tighter uppercase font-outfit">TFRO / Research</p>
            <p className="text-[10px] text-[var(--text-muted)]">© 2026 High-Fidelity Risk Labs</p>
          </div>
          <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.25em] font-black text-[var(--text-muted)]">
            {['Giotto-TDA', 'XGBoost v2', 'FastAPI RT', 'React 19'].map(t => (
              <span key={t} className="hover:text-white transition-colors cursor-default">{t}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
