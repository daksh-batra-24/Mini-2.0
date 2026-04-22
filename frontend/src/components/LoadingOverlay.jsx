import { useEffect, useState } from 'react';

const STEPS = [
  { label: 'Fetching market data', duration: 1200 },
  { label: 'Building sliding window', duration: 2200 },
  { label: 'Computing persistence diagrams', duration: 3800 },
  { label: 'Extracting manifold velocity', duration: 5800 },
  { label: 'Running ensemble vote', duration: 8000 },
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
    <div className="w-full max-w-lg mx-auto py-20 flex flex-col items-center animate-fade-in-up">

      {/* Spinner */}
      <div className="relative w-14 h-14 mb-10">
        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div className="absolute inset-0 rounded-full border border-t-white/60 border-l-white/20 border-r-transparent border-b-transparent animate-spin" />
        <div className="absolute inset-[5px] rounded-full border border-white/5 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-neon-pulse shadow-[0_0_8px_white]" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-black text-white uppercase tracking-tighter font-outfit mb-1">
        EXTRACTING_MANIFOLD
      </h3>
      <p className="label-xs mb-8">TDA Pipeline · ~10s latency</p>

      {/* Progress bar */}
      <div className="w-full h-px mb-8 relative" style={{ background: 'var(--border-subtle)' }}>
        <div
          className="absolute inset-y-0 left-0 animate-progress-bar"
          style={{ background: 'var(--text-secondary)', borderRadius: 1 }}
        />
      </div>

      {/* Step list */}
      <div className="w-full flex flex-col gap-2.5">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div
              key={step.label}
              className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: done ? 0.4 : active ? 1 : 0.15 }}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all"
                style={{
                  borderColor: done ? 'transparent' : active ? 'var(--text-secondary)' : 'var(--border-subtle)',
                  background: done ? 'var(--border-accent)' : 'transparent',
                }}
              >
                {done && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {active && (
                  <div className="w-1 h-1 rounded-full bg-white animate-neon-pulse" />
                )}
              </div>
              <span
                className="text-[11px] font-medium font-jetbrains"
                style={{ color: done ? 'var(--text-muted)' : active ? 'white' : 'var(--text-muted)' }}
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
