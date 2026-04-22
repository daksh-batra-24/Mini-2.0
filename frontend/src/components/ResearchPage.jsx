const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const IVORY = '#FDFBF7';
const FONT  = '"Times New Roman", Times, serif';
const SURF  = '#F3F1EB';

const PIPELINE_STEPS = [
  { id: '01', label: 'Raw OHLC',             sub: '2-Year Window',        icon: '▤' },
  { id: '02', label: 'Sliding Window',        sub: 'Size=20, Stride=1',   icon: '⧉' },
  { id: '03', label: 'Takens Embedding',      sub: '3D, τ=1',             icon: '⬡' },
  { id: '04', label: 'Vietoris-Rips',         sub: 'H₀, H₁ Homology',    icon: '◎' },
  { id: '05', label: 'Persistence Landscape', sub: '10 bins × 2 dims',    icon: '≋' },
  { id: '06', label: 'Manifold Velocity',     sub: 'First Derivative (Δ)', icon: '∂' },
  { id: '07', label: 'PCA Compression',       sub: '40+ → 5 Components',  icon: '⊕' },
  { id: '08', label: 'Ensemble Vote',         sub: 'XGB + RF + LR',       icon: '⊗' },
];

const PERFORMANCE_DATA = [
  { model: 'Baseline (TA Only)', accuracy: '67.4%', f1: '0.383', mcc: '0.172', notes: 'RSI + MACD only' },
  { model: 'TDA Only',           accuracy: '71.2%', f1: '0.421', mcc: '0.238', notes: 'Topology, no TA' },
  { model: 'Full Ensemble',      accuracy: '75.3%', f1: '0.450', mcc: '0.291', notes: 'TDA + TA fusion', highlight: true },
];

const PROBLEMS = [
  { title: 'Euclidean Blindspot', desc: 'Traditional models treat price as a 1D time series, missing multi-dimensional structural topology that precedes crashes.' },
  { title: 'Class Imbalance',    desc: 'Crashes are rare events (<5% of trading days). Standard classifiers are biased toward predicting "safe" at all times.' },
  { title: 'Regime Drift',       desc: 'A model trained on 2020 data will fail in 2024 micro-regimes. Static weights cannot adapt to market phase transitions.' },
];

const TECH_STACK = [
  { name: 'Giotto-TDA',   role: 'Topological Data Analysis' },
  { name: 'XGBoost',      role: 'Gradient Boosting Classifier' },
  { name: 'scikit-learn', role: 'RF + LR + Ensemble Voting' },
  { name: 'FastAPI',      role: 'Async REST Backend' },
  { name: 'yfinance',     role: 'Market Data Fetcher' },
  { name: 'React + Vite', role: 'Frontend Interface' },
];

export default function ResearchPage() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 56, paddingTop: 8, fontFamily: FONT }}
      className="animate-fade-in-up"
    >

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: `1px solid rgba(11,29,58,0.12)`, paddingBottom: 32 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#7A8EA8' }}>
          Academic Research
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: NAVY, letterSpacing: '0.03em', lineHeight: 1.1 }}>
          Research<br />Methodology
        </h1>
        <p style={{ fontSize: 13, color: '#3D5275', maxWidth: 560, lineHeight: 1.8, marginTop: 4 }}>
          TFRO applies Topological Data Analysis to detect manifold shattering — the geometric
          precursor to structural market crashes — before they register as price movements.
        </p>
      </div>

      {/* ── The Problem ──────────────────────────────────────────── */}
      <Section label="01" title="The Problem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'rgba(11,29,58,0.15)', marginTop: 20 }}>
          {PROBLEMS.map(p => (
            <div key={p.title} style={{ background: IVORY, padding: '20px 22px' }}>
              <div style={{ width: 20, height: 2, background: NAVY, marginBottom: 14, opacity: 0.4 }} />
              <h3 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', color: NAVY, marginBottom: 10 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: '#3D5275' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TDA Pipeline ─────────────────────────────────────────── */}
      <Section label="02" title="TDA Pipeline">
        <p style={{ fontSize: 12, color: '#3D5275', lineHeight: 1.75, maxWidth: 640, marginTop: 8, marginBottom: 20 }}>
          Instead of treating price as a 1D signal, TFRO projects it into a high-dimensional
          topological space and measures how fast the manifold is shattering — Manifold Velocity.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  background: SURF, border: `1px solid rgba(11,29,58,0.18)`,
                  padding: '12px 14px', minWidth: 92,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{step.icon}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', color: '#7A8EA8' }}>{step.id}</span>
                </div>
                <p style={{ fontSize: 10, fontWeight: 900, color: NAVY, marginBottom: 2 }}>{step.label}</p>
                <p style={{ fontSize: 8, color: '#7A8EA8' }}>{step.sub}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <span style={{ color: 'rgba(11,29,58,0.30)', fontSize: 10, fontWeight: 400 }}>›</span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Manifold Velocity ────────────────────────────────────── */}
      <Section label="03" title="Manifold Velocity">
        <div
          style={{ background: SURF, border: `1px solid rgba(11,29,58,0.15)`, padding: '24px 28px', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.20em', textTransform: 'uppercase', color: NAVY, marginBottom: 10 }}>
                The Innovation
              </h3>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: '#3D5275' }}>
                Standard TDA extracts static topological features. TFRO computes their{' '}
                <strong style={{ color: NAVY }}>first derivative</strong> — how fast the topology is changing.
                A market approaching a crash exhibits{' '}
                <em style={{ color: '#7A1515' }}>rapidly shattering topology</em>.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.20em', textTransform: 'uppercase', color: NAVY, marginBottom: 10 }}>
                Why It Works
              </h3>
              <p style={{ fontSize: 12, lineHeight: 1.8, color: '#3D5275' }}>
                The 40+ raw TDA features are compressed via PCA to 5 principal components,
                preventing overfitting on 2-year datasets (~500 rows) while retaining maximum topological signal.
              </p>
            </div>
          </div>
          <div style={{ borderTop: `1px solid rgba(11,29,58,0.12)`, paddingTop: 16 }}>
            <code style={{ fontSize: 11, color: '#1A5C2E', fontFamily: FONT }}>
              Δ(landscape) = landscape[t] − landscape[t−1] → PCA(hstack(landscape, Δ), n=5) → fuse(X_tda, X_ta)
            </code>
          </div>
        </div>
      </Section>

      {/* ── Ensemble Architecture ────────────────────────────────── */}
      <Section label="04" title="Ensemble Architecture">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, background: 'rgba(11,29,58,0.15)', marginTop: 16 }}>
          {[
            { name: 'XGBoost',             role: 'Non-linear specialist', accent: '#1A5C2E',
              desc: 'Captures complex topological shattering signals with √pos_ratio sample weighting.' },
            { name: 'Random Forest',        role: 'Variance reducer',      accent: GOLD,
              desc: 'Bagging-based hedge against overfitting on small regime-specific datasets.' },
            { name: 'Logistic Regression',  role: 'Linear baseline',        accent: '#3D5275',
              desc: 'Keeps the ensemble grounded when non-linear models diverge from trend.' },
          ].map(m => (
            <div key={m.name} style={{ background: IVORY, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
              {/* Top accent rule */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: m.accent }} />
              <h3 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', color: NAVY, marginBottom: 4, marginTop: 8 }}>
                {m.name}
              </h3>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: m.accent, marginBottom: 10 }}>
                {m.role}
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: '#3D5275' }}>{m.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background: SURF, border: `1px solid rgba(11,29,58,0.15)`, padding: '14px 18px', marginTop: 2 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 6 }}>
            Voting Strategy
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.75, color: '#3D5275' }}>
            <strong style={{ color: NAVY }}>Soft voting</strong> — averages class probabilities across all three estimators.
            The final crash probability is a balanced signal, not a majority-rules vote.
          </p>
        </div>
      </Section>

      {/* ── Ablation Study ───────────────────────────────────────── */}
      <Section label="05" title="Ablation Study">
        <p style={{ fontSize: 12, color: '#3D5275', marginTop: 8, marginBottom: 16 }}>
          Evaluated on MSFT 2-year dataset, chronological 80/20 split. No data leakage.
        </p>
        <div style={{ border: `1px solid rgba(11,29,58,0.25)` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT }}>
            <thead>
              <tr style={{ background: SURF, borderBottom: `1px solid rgba(11,29,58,0.20)` }}>
                {['Model', 'Accuracy', 'F1-Score', 'MCC', 'Notes'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase',
                      color: '#7A8EA8', fontFamily: FONT,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_DATA.map(row => (
                <tr
                  key={row.model}
                  style={{
                    background: row.highlight ? 'rgba(197,160,40,0.06)' : IVORY,
                    borderBottom: `1px solid rgba(11,29,58,0.10)`,
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: row.highlight ? 900 : 600, color: row.highlight ? NAVY : '#3D5275' }}>
                        {row.model}
                      </span>
                      {row.highlight && (
                        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', border: `1px solid ${GOLD}`, color: GOLD, padding: '1px 6px' }}>
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 900, color: NAVY }}>{row.accuracy}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#3D5275' }}>{row.f1}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#3D5275' }}>{row.mcc}</td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: '#7A8EA8' }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: SURF, border: `1px solid rgba(11,29,58,0.15)`, padding: '14px 18px', marginTop: 2 }}>
          <p style={{ fontSize: 12, lineHeight: 1.75, color: '#3D5275' }}>
            <strong style={{ color: NAVY }}>MCC (Matthews Correlation Coefficient)</strong> is used as the primary metric
            because it accounts for class imbalance more honestly than accuracy or F1.
            A random classifier scores 0; a perfect classifier scores 1.
          </p>
        </div>
      </Section>

      {/* ── Technology Stack ─────────────────────────────────────── */}
      <Section label="06" title="Technology Stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: 'rgba(11,29,58,0.15)', marginTop: 16 }}>
          {TECH_STACK.map(t => (
            <div
              key={t.name}
              style={{
                background: IVORY, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ width: 4, height: 4, background: NAVY, flexShrink: 0, opacity: 0.4 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{t.name}</p>
                <p style={{ fontSize: 10, color: '#7A8EA8', marginTop: 2 }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}

/* Section header component */
function Section({ label, title, children }) {
  return (
    <section style={{ fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#7A8EA8', fontFamily: FONT }}>
          {label}
        </span>
        <div style={{ width: 1, height: 16, background: 'rgba(11,29,58,0.25)' }} />
        <h2 style={{ fontSize: 17, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.10em', color: NAVY }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
