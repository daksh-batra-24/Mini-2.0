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
    <div className="flex flex-col gap-14 py-6 animate-fade-in-up max-w-4xl">

      {/* Hero */}
      <div className="flex flex-col gap-4">
        <span className="label-xs tracking-[0.25em]">Academic Research</span>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-outfit leading-tight">
          Research<br />Methodology
        </h1>
        <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
          TFRO applies Topological Data Analysis to detect manifold shattering — the geometric precursor
          to structural market crashes — before they register as price movements.
        </p>
      </div>

      {/* The Problem */}
      <section>
        <SectionHeader label="01" title="The Problem" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {PROBLEMS.map(p => (
            <div
              key={p.title}
              className="rounded-2xl p-5 border flex flex-col gap-3"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="w-5 h-0.5 bg-white opacity-40" />
              <h3 className="font-black text-white text-sm uppercase tracking-wide">{p.title}</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TDA Pipeline */}
      <section>
        <SectionHeader label="02" title="TDA Pipeline" />
        <p className="text-[12px] mt-2 mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Instead of treating price as a 1D signal, TFRO projects it into a high-dimensional topological
          space and measures how fast the manifold is shattering — Manifold Velocity.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className="rounded-xl p-3.5 flex flex-col gap-1 border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', minWidth: 96 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{step.icon}</span>
                  <span className="label-xs">{step.id}</span>
                </div>
                <p className="text-[11px] font-bold text-white mt-0.5">{step.label}</p>
                <p className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>{step.sub}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Manifold Velocity */}
      <section>
        <SectionHeader label="03" title="Manifold Velocity" />
        <div
          className="mt-5 rounded-2xl p-7 border flex flex-col gap-6"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2.5">The Innovation</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Standard TDA extracts static topological features. TFRO computes their{' '}
                <strong className="text-white font-bold">first derivative</strong> — how fast the topology is changing.
                A market approaching a crash has{' '}
                <em style={{ color: 'var(--accent-neon-orange)' }}>rapidly shattering topology</em>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2.5">Why It Works</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                The 40+ raw TDA features are compressed via PCA to 5 principal components.
                This prevents overfitting on 2-year datasets (~500 rows) while retaining maximum topological signal.
              </p>
            </div>
          </div>
          <div className="pt-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <code className="text-[11px] font-jetbrains" style={{ color: 'var(--accent-neon-green)' }}>
              Δ(landscape) = landscape[t] − landscape[t-1] → PCA(hstack(landscape, Δ), n=5) → fuse(X_tda, X_ta)
            </code>
          </div>
        </div>
      </section>

      {/* Ensemble Architecture */}
      <section>
        <SectionHeader label="04" title="Ensemble Architecture" />
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'XGBoost', role: 'Non-linear specialist', desc: 'Captures complex topological shattering signals with √pos_ratio sample weighting.', accent: 'var(--accent-neon-green)', hex: '#00ff88' },
            { name: 'Random Forest', role: 'Variance reducer', desc: 'Bagging-based hedge against overfitting on small regime-specific datasets.', accent: 'var(--accent-neon-yellow)', hex: '#ffdd00' },
            { name: 'Logistic Regression', role: 'Linear baseline', desc: 'Keeps the ensemble grounded when non-linear models diverge from true trend.', accent: 'var(--accent-neon-orange)', hex: '#ff5500' },
          ].map(m => (
            <div
              key={m.name}
              className="rounded-2xl p-5 border flex flex-col gap-3 relative overflow-hidden"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: m.accent, opacity: 0.6 }} />
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wide">{m.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: m.accent }}>{m.role}</p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
            </div>
          ))}
        </div>
        <div
          className="mt-3 p-4 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="label-xs mb-1.5">Voting Strategy</p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong className="text-white font-semibold">Soft voting</strong> — averages class probabilities across all three estimators.
            The final crash probability is a balanced signal, not a majority-rules vote.
          </p>
        </div>
      </section>

      {/* Performance */}
      <section>
        <SectionHeader label="05" title="Ablation Study" />
        <p className="text-[12px] mt-2 mb-5" style={{ color: 'var(--text-secondary)' }}>
          Evaluated on MSFT 2-year dataset, chronological 80/20 split. No data leakage.
        </p>
        <div className="card-noir rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                {['Model', 'Accuracy', 'F1-Score', 'MCC', 'Notes'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left label-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_DATA.map(row => (
                <tr
                  key={row.model}
                  className="border-b last:border-0 transition-colors"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: row.highlight ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-semibold ${row.highlight ? 'text-white' : ''}`} style={!row.highlight ? { color: 'var(--text-secondary)' } : {}}>
                        {row.model}
                      </span>
                      {row.highlight && (
                        <span
                          className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border"
                          style={{ color: 'var(--accent-neon-green)', borderColor: 'var(--accent-neon-green)' }}
                        >
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[12px] font-black font-jetbrains text-white">{row.accuracy}</td>
                  <td className="px-5 py-4 text-[12px] font-jetbrains" style={{ color: 'var(--text-secondary)' }}>{row.f1}</td>
                  <td className="px-5 py-4 text-[12px] font-jetbrains" style={{ color: 'var(--text-secondary)' }}>{row.mcc}</td>
                  <td className="px-5 py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="mt-3 p-4 rounded-xl border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong className="text-white font-semibold">MCC (Matthews Correlation Coefficient)</strong> is used as the primary metric
            because it accounts for class imbalance more honestly than accuracy or F1.
            A random classifier scores 0; a perfect classifier scores 1.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <SectionHeader label="06" title="Technology Stack" />
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {TECH_STACK.map(t => (
            <div
              key={t.name}
              className="flex items-center gap-3 p-4 rounded-xl border transition-colors"
              style={{ borderColor: 'var(--border-subtle)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-bold text-white">{t.name}</p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
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
    <div className="flex items-center gap-3">
      <span className="label-xs font-jetbrains opacity-60">{label}</span>
      <div className="w-px h-4" style={{ background: 'var(--border-accent)' }} />
      <h2 className="text-lg font-black text-white uppercase tracking-tight font-outfit">{title}</h2>
    </div>
  );
}
