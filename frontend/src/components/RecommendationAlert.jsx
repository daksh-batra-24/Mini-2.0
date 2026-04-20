/**
 * RecommendationAlert — Stylized alert box for the risk recommendation.
 * Pulses red when risk level is "High".
 */
export default function RecommendationAlert({ riskLevel, recommendation, ticker, currentPrice, historicalAccuracy }) {
  const isHigh = riskLevel === 'High';
  const isMedium = riskLevel === 'Medium';

  const borderColor = isHigh
    ? 'border-red-500/60'
    : isMedium
      ? 'border-yellow-500/40'
      : 'border-emerald-500/30';

  const iconBg = isHigh
    ? 'bg-red-500/15'
    : isMedium
      ? 'bg-yellow-500/10'
      : 'bg-emerald-500/10';

  const iconColor = isHigh
    ? 'text-red-400'
    : isMedium
      ? 'text-yellow-400'
      : 'text-emerald-400';

  return (
    <div
      className={`
        flex-1 rounded-2xl border ${borderColor} p-6
        bg-[var(--bg-card)] backdrop-blur-sm
        ${isHigh ? 'animate-pulse-red' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          {isHigh ? (
            <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Risk Assessment — {ticker}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Current Price: ${currentPrice?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recommendation body */}
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {recommendation}
      </p>

      {/* Risk label pill */}
      <div className="mt-4 flex items-center gap-2">
        <span className={`
          inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide
          ${isHigh ? 'bg-red-500/15 text-red-400' : isMedium ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400'}
        `}>
          {riskLevel} Risk
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          5-day forward outlook
        </span>
        
        {historicalAccuracy !== undefined && historicalAccuracy > 0 && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ticker Accuracy: {historicalAccuracy}%
          </span>
        )}
      </div>
    </div>
  );
}
