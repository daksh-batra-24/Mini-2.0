/**
 * ResearchPage — Academic methodology and performance overview.
 */

const PIPELINE_STEPS = [
  { id: '01', label: 'Raw OHLC', sub: '2-Year Window', icon: '▤' },
  { id: '02', label: 'Sliding Window', sub: 'Size=20, Stride=1', icon: '⧉' },
  { id: '03', label: 'Takens Embedding', sub: '3D, τ=1', icon: '⬡' },
  { id: '04', label: 'Vietoris-Rips', sub: 'H₀, H₁ Homology', icon: '◎' },
  { id: '05', label: 'Persistence Landscape', sub: '10 bins × 2 dims', icon: '≋' },
  { id: '06', label: 'Manifold Velocity', sub: 'First Derivative (Δ)', icon: '∂' },
  { id: '07', label: 'PCA Compression', sub: '40+ → 5 Components', icon: '⊕' },
  { id: '08', label: 'Ensemble Vote', sub: 'XGB + RF + LR', icon: '⊗' },
];

const PERFORMANCE_DATA = [
  { model: 'Baseline (TA Only)', accuracy: '67.4%', f1: '0.383', mcc: '0.172', notes: 'RSI + MACD only' },
  { model: 'TDA Only', accuracy: '71.2%', f1: '0.421', mcc: '0.238', notes: 'Topology, no TA' },
  { model: 'Full Ensemble', accuracy: '75.3%', f1: '0.450', mcc: '0.291', notes: 'TDA + TA fusion', highlight: true },
];

const PROBLEMS = [
  {
    title: 'Euclidean Blindspot',
    desc: 'Traditional models treat price as a 1D time series, missing multi-dimensional structural topology that precedes crashes.',
  },
  {
    title: 'Class Imbalance',
    desc: 'Crashes are rare events (<5% of trading days). Standard classifiers are biased toward predicting "safe" at all times.',
  },
  {
    title: 'Regime Drift',
    desc: 'A model trained on 2020 data will fail in 2024 micro-regimes. Static weights cannot adapt to market phase transitions.',
  },
];

const TECH_STACK = [
  { name: 'Giotto-TDA', role: 'Topological Data Analysis' },
  { name: 'XGBoost', role: 'Gradient Boosting Classifier' },
  { name: 'scikit-learn', role: 'RF + LR + Ensemble Voting' },
  { name: 'FastAPI', role: 'Async REST Backend' },
  { name: 'yfinance', role: 'Market Data Fetcher' },
  { name: 'React + Vite', role: 'Frontend Interface' },
];

export default function ResearchPage() {
  return (
    <div className="flex flex-col gap-16 py-8 animate-fade-in-up">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="text-center flex flex-col items-center gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] border border-[var(--border-subtle)] px-4 py-2 rounded-full">
          Academic Research
        </div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter font-outfit">
          Research Lab
        </h1>
        <p className="text-[var(--text-secondary)] max-w-xl text-sm leading-relaxed">
          TFRO applies Topological Data Analysis to detect manifold shattering — the geometric precursor
          to structural market crashes — before they register as price movements.
        </p>
      </div>

      {/* ── The Problem ──────────────────────────────────────────────────── */}
      <section>
        <SectionHeader label="01" title="The Problem" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {PROBLEMS.map(p => (
            <div key={p.title} className="card-noir rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-6 h-1 bg-white" />
              <h3 className="font-black text-white uppercase text-sm tracking-wide">{p.title}</h3>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TDA Pipeline ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader label="02" title="TDA Pipeline" />
        <p className="text-[var(--text-secondary)] text-xs mt-2 mb-6 leading-relaxed max-w-2xl">
          Instead of treating price as a 1D signal, TFRO projects it into a high-dimensional topological
          space and measures how fast the manifold is shattering (Manifold Velocity).
        </p>
        <div className="relative">
          {/* Pipeline flow */}
          <div className="flex flex-wrap gap-3 items-center">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="card-noir rounded-xl p-4 flex flex-col gap-1.5 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-white">{step.icon}</span>
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{step.id}</span>
                  </div>
                  <p className="text-[11px] font-black text-white">{step.label}</p>
                  <p className="text-[9px] text-[var(--text-muted)]">{step.sub}</p>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span className="text-[var(--text-muted)] text-sm flex-shrink-0">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manifold Velocity ────────────────────────────────────────────── */}
      <section>
        <SectionHeader label="03" title="Manifold Velocity" />
        <div className="mt-6 card-noir rounded-2xl p-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">The Innovation</h3>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                Standard TDA extracts static topological features. TFRO computes their <strong className="text-white">first derivative</strong> —
                how fast the topology is changing. A market in a stable trend has slow topology.
                A market approaching a crash has <em className="text-[var(--accent-neon-orange)]">rapidly shattering topology</em>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">Why It Works</h3>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                The 40+ raw TDA features (landscapes + deltas) are compressed via PCA to 5 principal components.
                This prevents overfitting on 2-year datasets (~500 rows) while retaining maximum topological signal.
              </p>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-2">
            <code className="text-xs font-jetbrains text-[var(--accent-neon-green)]">
              Δ(landscape) = landscape[t] − landscape[t-1] &nbsp;→&nbsp; PCA(hstack(landscape, Δ), n=5) &nbsp;→&nbsp; fuse(X_tda, X_ta)
            </code>
          </div>
        </div>
      </section>

      {/* ── Ensemble Architecture ────────────────────────────────────────── */}
      <section>
        <SectionHeader label="04" title="Ensemble Architecture" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'XGBoost', role: 'Non-linear specialist', desc: 'Captures complex topological shattering signals with √pos_ratio safe weighting.', accent: 'var(--accent-neon-green)' },
            { name: 'Random Forest', role: 'Variance reducer', desc: 'Bagging-based hedge against overfitting on small regime-specific datasets.', accent: 'var(--accent-neon-yellow)' },
            { name: 'Logistic Regression', role: 'Linear baseline', desc: 'Keeps the ensemble grounded when non-linear models diverge from true trend.', accent: 'var(--accent-neon-orange)' },
          ].map(m => (
            <div key={m.name} className="card-noir rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: m.accent }} />
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wide">{m.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: m.accent }}>{m.role}</p>
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Voting Strategy</p>
          <p className="text-xs text-[var(--text-secondary)]">
            <strong className="text-white">Soft voting</strong> — averages class probabilities across all three estimators.
            The final crash probability is a balanced signal from all three specialists,
            not a majority-rules vote that could be dominated by one overfit model.
          </p>
        </div>
      </section>

      {/* ── Performance ──────────────────────────────────────────────────── */}
      <section>
        <SectionHeader label="05" title="Ablation Study" />
        <p className="text-[var(--text-secondary)] text-xs mt-2 mb-6">
          Evaluated on MSFT 2-year dataset, chronological 80/20 split. No data leakage.
        </p>
        <div className="card-noir rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                {['Model', 'Accuracy', 'F1-Score', 'MCC', 'Notes'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_DATA.map(row => (
                <tr
                  key={row.model}
                  className={`border-b border-[var(--border-subtle)] last:border-0 ${row.highlight ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="px-5 py-4">
                    <span className={`font-bold text-xs ${row.highlight ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{row.model}</span>
                    {row.highlight && <span className="ml-2 text-[9px] font-black uppercase text-[var(--accent-neon-green)] border border-[var(--accent-neon-green)] px-1.5 py-0.5 rounded">Best</span>}
                  </td>
                  <td className="px-5 py-4 font-jetbrains text-xs font-bold text-white">{row.accuracy}</td>
                  <td className="px-5 py-4 font-jetbrains text-xs text-[var(--text-secondary)]">{row.f1}</td>
                  <td className="px-5 py-4 font-jetbrains text-xs text-[var(--text-secondary)]">{row.mcc}</td>
                  <td className="px-5 py-4 text-[10px] text-[var(--text-muted)]">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
            <strong className="text-white">MCC (Matthews Correlation Coefficient)</strong> is used as the primary metric
            because it accounts for class imbalance more honestly than accuracy or F1.
            A random classifier scores 0; a perfect classifier scores 1.
          </p>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────────────────────────────── */}
      <section>
        <SectionHeader label="06" title="Technology Stack" />
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {TECH_STACK.map(t => (
            <div key={t.name} className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-white">{t.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function SectionHeader({ label, title }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-black text-[var(--text-muted)] font-jetbrains">{label}</span>
      <div className="w-px h-5 bg-[var(--border-subtle)]" />
      <h2 className="text-xl font-black text-white uppercase tracking-tight font-outfit">{title}</h2>
    </div>
  );
}
