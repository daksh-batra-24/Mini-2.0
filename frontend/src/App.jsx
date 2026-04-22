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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const HEADER_H = 60;

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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-noir" style={{ height: HEADER_H }}>
        <div className="h-full max-w-[1400px] mx-auto px-5 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 select-none">
            <div
              className="w-7 h-7 rounded-lg border flex items-center justify-center"
              style={{ borderColor: 'var(--border-accent)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight uppercase font-outfit leading-none">TFRO</h1>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Risk Optimizer</p>
            </div>
          </div>

          {/* Nav */}
          <nav
            className="hidden sm:flex items-center gap-0.5 rounded-xl p-1 border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            {[
              { id: 'home', label: 'Dashboard' },
              { id: 'research', label: 'Research' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                  page === id
                    ? 'bg-white text-black'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full animate-neon-pulse"
                style={{
                  background: 'var(--accent-neon-green)',
                  boxShadow: '0 0 6px var(--accent-neon-green)',
                }}
              />
              <span
                className="text-[9px] uppercase tracking-[0.2em] font-bold"
                style={{ color: 'var(--accent-neon-green)' }}
              >
                Engine Live
              </span>
            </div>
            <button
              className="lg:hidden p-2 rounded-xl border transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onClick={() => setMobileSidebarOpen(v => !v)}
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/70 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`
            flex-col w-60 flex-shrink-0 border-r p-5 gap-0
            sticky overflow-y-auto
            lg:flex
            ${mobileSidebarOpen
              ? 'flex fixed z-40 w-72 shadow-2xl'
              : 'hidden'}
          `}
          style={{
            top: HEADER_H,
            height: `calc(100vh - ${HEADER_H}px)`,
            background: mobileSidebarOpen ? 'var(--bg-primary)' : 'transparent',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {mobileSidebarOpen && (
            <button
              className="self-end mb-4 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
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

          {/* Mobile nav */}
          <div
            className="sm:hidden mt-auto pt-5 border-t flex flex-col gap-1"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {[{ id: 'home', label: 'Dashboard' }, { id: 'research', label: 'Research' }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setPage(id); setMobileSidebarOpen(false); }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                  page === id ? 'text-white bg-white/8' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Panel ───────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-5 lg:px-10 py-10">

          {page === 'home' && (
            <div className="flex flex-col gap-10">

              {/* Search */}
              <section className="flex flex-col items-center">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              </section>

              {/* Error */}
              {error && (
                <div
                  className="rounded-2xl border p-4 text-center animate-fade-in-up"
                  style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
                >
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              {/* Loading */}
              {isLoading && <LoadingOverlay />}

              {/* Results */}
              {result && !isLoading && (
                <div className="flex flex-col gap-7 animate-fade-in-up">

                  {/* Ticker header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-white font-outfit tracking-tight">{result.ticker}</h2>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                        style={{ color: riskColor(result.risk_level), borderColor: riskColor(result.risk_level) + '66' }}
                      >
                        {result.risk_level} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-right">
                        <p className="label-xs mb-1">Model Certainty</p>
                        <p className="text-lg font-black font-jetbrains text-white leading-none">
                          {result.historical_accuracy_pct}
                          <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>%</span>
                        </p>
                      </div>
                      <button
                        onClick={addToWatchlist}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
                          isInWatchlist
                            ? 'bg-white/8 border-white/15 text-white'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-white'
                        }`}
                      >
                        {isInWatchlist ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Watching
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Watch
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Price chart */}
                  <PriceChart data={chartData} ticker={result.ticker} isRealData={isRealData} />

                  {/* System Inference */}
                  <div className="card-noir rounded-3xl overflow-hidden">
                    {/* Card header */}
                    <div
                      className="px-8 py-5 border-b flex items-center justify-between"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-widest font-outfit">
                          System Inference
                        </h2>
                        <p className="label-xs mt-0.5">
                          Topological Manifold Analysis · {result.ticker}
                        </p>
                      </div>
                      <div className="text-right sm:hidden">
                        <p className="label-xs mb-1">Certainty</p>
                        <p className="text-base font-black font-jetbrains text-white">
                          {result.historical_accuracy_pct}<span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>%</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col gap-10">
                      {/* Gauge + Radar */}
                      <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start">
                        <div className="flex-shrink-0">
                          <RiskGauge score={result.hidden_risk_score} />
                        </div>
                        <div className="flex-1 w-full min-w-0">
                          <FeatureRadar features={result.features || {}} currentPrice={result.current_price} />
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: 'var(--border-subtle)' }} />

                      {/* Recommendation */}
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
                <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in-up">
                  <div
                    className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-6"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                  >
                    <svg className="w-6 h-6 text-white opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 font-outfit">Ready for Analysis</h3>
                  <p className="text-sm font-medium max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Enter a ticker symbol to compute high-dimensional risk coefficients using Topological Data Analysis.
                  </p>
                  <button
                    onClick={() => setPage('research')}
                    className="mt-5 text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-white"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Learn the methodology →
                  </button>
                </div>
              )}
            </div>
          )}

          {page === 'research' && <ResearchPage />}
        </main>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-8 mt-auto"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="max-w-[1400px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-white uppercase font-outfit tracking-tight">TFRO</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>© 2026 High-Fidelity Risk Labs</p>
          </div>
          <div className="flex items-center gap-5">
            {['Giotto-TDA', 'XGBoost v2', 'FastAPI', 'React 19'].map((t, i, arr) => (
              <span key={t} className="flex items-center gap-5">
                <span
                  className="text-[9px] uppercase tracking-[0.2em] font-medium transition-colors cursor-default hover:text-white"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: 'var(--border-accent)' }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
