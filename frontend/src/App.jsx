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
const HEADER_H = 58;

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

/* Maps risk level string → institutional color */
function riskColor(level) {
  if (!level) return 'var(--text-muted)';
  const l = level.toLowerCase();
  if (l.includes('high'))   return 'var(--accent-neon-orange)';   /* crimson */
  if (l.includes('medium')) return 'var(--accent-neon-yellow)';   /* gold */
  return 'var(--accent-neon-green)';                              /* deep green */
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
        ticker: data.ticker, score: data.hidden_risk_score,
        riskLevel: data.risk_level, price: data.current_price,
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

  /* ── Shared border style ──────────────────────────────────────────────── */
  const navyBorder = { borderColor: 'var(--border-accent)' };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', fontFamily: '"Times New Roman", Times, serif' }}>

      {/* ════════════════════════════════════════════════════════════
          HEADER — ivory, 1px navy bottom rule
          ════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 glass-noir" style={{ height: HEADER_H }}>
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">

          {/* Logo wordmark */}
          <div className="flex items-center gap-3 flex-shrink-0 select-none">
            <div
              className="w-7 h-7 border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: 'var(--border-navy)', background: 'var(--bg-primary)' }}
            >
              <span style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: '"Times New Roman", Times, serif' }}>
                TF
              </span>
            </div>
            <div>
              <h1
                className="uppercase leading-none"
                style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.08em', fontFamily: '"Times New Roman", Times, serif' }}
              >
                TFRO
              </h1>
              <p className="label-xs" style={{ marginTop: 1 }}>Risk Optimizer</p>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="hidden sm:flex items-center border" style={navyBorder}>
            {[
              { id: 'home', label: 'Dashboard' },
              { id: 'research', label: 'Research' },
            ].map(({ id, label }, i, arr) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  padding: '6px 20px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontFamily: '"Times New Roman", Times, serif',
                  background: page === id ? 'var(--accent-gold)' : 'transparent',
                  color: page === id ? '#FDFBF7' : 'var(--text-secondary)',
                  borderRight: i < arr.length - 1 ? '1px solid var(--border-accent)' : 'none',
                  transition: 'background 0.15s ease, color 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 animate-neon-pulse"
                style={{ background: 'var(--accent-gold)', borderRadius: '50%' }}
              />
              <span className="label-xs" style={{ color: 'var(--accent-gold)', letterSpacing: '0.22em' }}>
                Engine Live
              </span>
            </div>
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 border transition-colors"
              style={navyBorder}
              onClick={() => setMobileSidebarOpen(v => !v)}
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          BODY
          ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(11,29,58,0.35)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside
          className={`
            flex-col w-56 flex-shrink-0 border-r p-5
            sticky overflow-y-auto
            lg:flex
            ${mobileSidebarOpen ? 'flex fixed z-40 w-64 shadow-xl' : 'hidden'}
          `}
          style={{
            top: HEADER_H,
            height: `calc(100vh - ${HEADER_H}px)`,
            background: 'var(--bg-primary)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {mobileSidebarOpen && (
            <button
              className="self-end mb-4"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="sm:hidden mt-auto pt-4 border-t flex flex-col gap-0.5" style={{ borderColor: 'var(--border-subtle)' }}>
            {[{ id: 'home', label: 'Dashboard' }, { id: 'research', label: 'Research' }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setPage(id); setMobileSidebarOpen(false); }}
                style={{
                  textAlign: 'left', padding: '8px 10px',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                  fontFamily: '"Times New Roman", Times, serif',
                  color: page === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: page === id ? 'var(--bg-surface)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Panel ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 lg:px-10 py-10">

          {/* ── Dashboard ──────────────────────────────────────────── */}
          {page === 'home' && (
            <div className="flex flex-col gap-10">

              <section className="flex flex-col items-center">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              </section>

              {/* Error banner */}
              {error && (
                <div
                  className="border p-4 text-center animate-fade-in-up"
                  style={{ borderColor: 'var(--accent-neon-orange)', background: 'rgba(122,21,21,0.05)' }}
                >
                  <p style={{ fontSize: 13, color: 'var(--accent-neon-orange)', fontFamily: '"Times New Roman", Times, serif' }}>
                    {error}
                  </p>
                </div>
              )}

              {isLoading && <LoadingOverlay />}

              {/* ── Results ────────────────────────────────────────── */}
              {result && !isLoading && (
                <div className="flex flex-col gap-7 animate-fade-in-up">

                  {/* Ticker header row */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-4">
                      <h2
                        className="uppercase"
                        style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.04em', fontFamily: '"Times New Roman", Times, serif' }}
                      >
                        {result.ticker}
                      </h2>
                      <span
                        className="border"
                        style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                          padding: '3px 10px', fontFamily: '"Times New Roman", Times, serif',
                          color: riskColor(result.risk_level),
                          borderColor: riskColor(result.risk_level),
                        }}
                      >
                        {result.risk_level} Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="hidden sm:block text-right">
                        <p className="label-xs">Model Certainty</p>
                        <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: '"Times New Roman", Times, serif', marginTop: 2 }}>
                          {result.historical_accuracy_pct}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 1 }}>%</span>
                        </p>
                      </div>

                      {/* Watch button */}
                      <button
                        onClick={addToWatchlist}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 16px',
                          border: `1px solid ${isInWatchlist ? 'var(--accent-gold)' : 'var(--border-accent)'}`,
                          background: isInWatchlist ? 'var(--accent-gold-bg)' : 'transparent',
                          color: isInWatchlist ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                          fontFamily: '"Times New Roman", Times, serif',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        {isInWatchlist ? '✓ Watching' : '+ Watch'}
                      </button>
                    </div>
                  </div>

                  {/* Price chart */}
                  <PriceChart data={chartData} ticker={result.ticker} isRealData={isRealData} />

                  {/* System Inference block */}
                  <div className="card-noir">
                    {/* Section header */}
                    <div
                      className="px-8 py-4 border-b flex items-center justify-between"
                      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}
                    >
                      <div>
                        <h2
                          className="uppercase"
                          style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.22em', color: 'var(--text-primary)', fontFamily: '"Times New Roman", Times, serif' }}
                        >
                          System Inference
                        </h2>
                        <p className="label-xs" style={{ marginTop: 3 }}>
                          Topological Manifold Analysis · {result.ticker}
                        </p>
                      </div>
                      <div className="sm:hidden text-right">
                        <p className="label-xs">Certainty</p>
                        <p style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', fontFamily: '"Times New Roman", Times, serif', marginTop: 2 }}>
                          {result.historical_accuracy_pct}<span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 1 }}>%</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col gap-10">
                      {/* Gauge + Radar */}
                      <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start">
                        <div className="flex-shrink-0">
                          <RiskGauge score={result.hidden_risk_score} riskLevel={result.risk_level} />
                        </div>
                        <div className="flex-1 w-full min-w-0">
                          <FeatureRadar features={result.features || {}} currentPrice={result.current_price} />
                        </div>
                      </div>

                      {/* Hairline divider */}
                      <div style={{ height: 1, background: 'var(--border-subtle)' }} />

                      {/* Recommendation */}
                      <RecommendationAlert
                        riskLevel={result.risk_level}
                        recommendation={result.recommendation}
                        currentPrice={result.current_price}
                        features={result.features || {}}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Empty state ─────────────────────────────────────── */}
              {!result && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in-up">
                  <div
                    className="w-12 h-12 border flex items-center justify-center mb-7"
                    style={{ borderColor: 'var(--border-accent)', background: 'var(--bg-surface)' }}
                  >
                    <span style={{ fontSize: 18, color: 'var(--text-muted)', fontFamily: 'serif' }}>∂</span>
                  </div>
                  <h3
                    className="uppercase mb-2"
                    style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--text-primary)', fontFamily: '"Times New Roman", Times, serif' }}
                  >
                    Ready for Analysis
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.7, fontFamily: '"Times New Roman", Times, serif', marginTop: 4 }}>
                    Enter a ticker symbol to compute high-dimensional risk coefficients using Topological Data Analysis.
                  </p>
                  <button
                    onClick={() => setPage('research')}
                    style={{
                      marginTop: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: 'var(--text-muted)', fontFamily: '"Times New Roman", Times, serif',
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)', paddingBottom: 1,
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderBottomColor = 'var(--border-accent)'; }}
                    onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderBottomColor = 'var(--border-subtle)'; }}
                  >
                    View methodology →
                  </button>
                </div>
              )}
            </div>
          )}

          {page === 'research' && <ResearchPage />}
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════
          FOOTER — ivory, 1px navy top rule
          ════════════════════════════════════════════════════════════ */}
      <footer className="border-t py-6 mt-auto" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p
              className="uppercase"
              style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: 'var(--text-primary)', fontFamily: '"Times New Roman", Times, serif' }}
            >
              TFRO
            </p>
            <p className="label-xs" style={{ marginTop: 2 }}>© 2026 High-Fidelity Risk Labs</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {['Giotto-TDA', 'XGBoost v2', 'FastAPI', 'React 19'].map((t, i, arr) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <span className="label-xs" style={{ cursor: 'default' }}>{t}</span>
                {i < arr.length - 1 && <span style={{ color: 'var(--border-accent)' }}>·</span>}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
