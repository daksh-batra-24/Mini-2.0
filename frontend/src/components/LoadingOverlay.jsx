import { useEffect, useState } from 'react';

const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const FONT  = '"Times New Roman", Times, serif';

const STEPS = [
  { label: 'Fetching market data',         duration: 1200 },
  { label: 'Building sliding window',      duration: 2400 },
  { label: 'Computing persistence diagrams', duration: 3900 },
  { label: 'Extracting manifold velocity', duration: 5800 },
  { label: 'Running ensemble vote',        duration: 8200 },
];

export default function LoadingOverlay() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((step, i) =>
      setTimeout(() => setActiveStep(i + 1), step.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        width: '100%', maxWidth: 520, margin: '0 auto',
        padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: FONT,
      }}
      className="animate-fade-in-up"
    >
      {/* ── Minimalist navy spinner ─────────────────────────────────── */}
      <div style={{ position: 'relative', width: 48, height: 48, marginBottom: 36 }}>
        {/* Static outer square border */}
        <div style={{ position: 'absolute', inset: 0, border: `1px solid rgba(11,29,58,0.18)` }} />
        {/* Rotating inner square — 1px navy, no glow */}
        <div
          className="animate-spin-slow"
          style={{
            position: 'absolute', inset: 6,
            border: `1px solid ${NAVY}`,
            borderTopColor: 'transparent', borderRightColor: 'transparent',
          }}
        />
        {/* Gold dot center */}
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 5, height: 5, background: GOLD,
          }}
        />
      </div>

      {/* ── Title ──────────────────────────────────────────────────── */}
      <h3
        style={{
          fontSize: 14, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: NAVY, marginBottom: 4,
        }}
      >
        Extracting Manifold
      </h3>
      <p
        style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#7A8EA8', marginBottom: 28,
        }}
      >
        TDA Pipeline · ~10s Latency
      </p>

      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div style={{ width: '100%', height: 1, background: 'rgba(11,29,58,0.12)', marginBottom: 28, position: 'relative' }}>
        <div
          className="animate-progress-bar"
          style={{ position: 'absolute', inset: 0, background: NAVY, right: 'auto' }}
        />
      </div>

      {/* ── Step list ──────────────────────────────────────────────── */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map((step, i) => {
          const done   = i < activeStep;
          const active = i === activeStep;
          return (
            <div
              key={step.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: done ? 0.38 : active ? 1 : 0.18,
                transition: 'opacity 0.4s ease',
              }}
            >
              {/* Step indicator */}
              <div
                style={{
                  width: 16, height: 16, flexShrink: 0,
                  border: `1px solid ${done ? 'transparent' : active ? NAVY : 'rgba(11,29,58,0.30)'}`,
                  background: done ? 'rgba(11,29,58,0.12)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {done && (
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke={NAVY} strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {active && (
                  /* Gold square pulse instead of neon dot */
                  <div className="animate-neon-pulse" style={{ width: 5, height: 5, background: GOLD }} />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 11, fontWeight: done ? 400 : active ? 700 : 400,
                  color: done ? '#7A8EA8' : active ? NAVY : '#7A8EA8',
                  letterSpacing: '0.04em',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
