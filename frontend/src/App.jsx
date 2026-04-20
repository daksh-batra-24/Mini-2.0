import { useState } from 'react';
import SearchBar from './components/SearchBar';
import PriceChart from './components/PriceChart';
import RiskGauge from './components/RiskGauge';
import RecommendationAlert from './components/RecommendationAlert';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

const API_BASE = 'http://localhost:8000';

/**
 * Generate mock 30-day price data that ends at the given current price.
 * In production this would come from the API; here we create a realistic
 * random-walk seeded from the actual current price so the chart looks natural.
 */
function generateMockPriceData(currentPrice, days = 30) {
  const data = [];
  const volatility = currentPrice * 0.012; // ~1.2% daily vol
  let price = currentPrice * (1 - (Math.random() * 0.06 - 0.01)); // start 1-5% away

  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Drift toward current price on the last few days
    const drift = i < 5 ? (currentPrice - price) * 0.3 : 0;
    price += drift + (Math.random() - 0.48) * volatility;
    price = Math.max(price, currentPrice * 0.85); // floor

    data.push({ date: label, close: parseFloat(price.toFixed(2)) });
  }
  // Pin the final bar to the real current price
  data[data.length - 1].close = currentPrice;
  return data;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);     // API response
  const [chartData, setChartData] = useState([]);  // 30-day chart data

  const handleSearch = async (ticker) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setChartData([]);

    try {
      const res = await fetch(`${API_BASE}/predict/${ticker}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
      setChartData(generateMockPriceData(data.current_price));
    } catch (err) {
      setError(err.message || 'Failed to connect to the analysis server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                Hidden Risk Stop-Loss Optimizer
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] font-medium tracking-wide">
                TDA-Powered Drawdown Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Search bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error state */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-center animate-fade-in-up">
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <LoadingOverlay />}

        {/* Results */}
        {result && !isLoading && (
          <div className="flex flex-col gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Price chart */}
            <PriceChart data={chartData} ticker={result.ticker} />

            {/* Topological Risk Assessment section */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-400" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Topological Risk Assessment
                </h2>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Gauge */}
                <RiskGauge score={result.hidden_risk_score} />

                {/* Recommendation alert */}
                <RecommendationAlert
                  riskLevel={result.risk_level}
                  recommendation={result.recommendation}
                  ticker={result.ticker}
                  currentPrice={result.current_price}
                  historicalAccuracy={result.historical_accuracy_pct}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !isLoading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-[var(--text-secondary)] mb-1">
              Enter a ticker to begin
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm">
              This tool uses Topological Data Analysis to detect hidden structural risk patterns 
              in recent price action that traditional indicators miss.
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] py-4">
        <p className="text-center text-xs text-[var(--text-muted)]">
          Powered by giotto-tda • XGBoost • FastAPI — For educational purposes only. Not financial advice.
        </p>
      </footer>
    </div>
  );
}
