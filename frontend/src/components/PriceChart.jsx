import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-2xl"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-accent)',
      }}
    >
      <p className="label-xs mb-2">{label}</p>
      <p className="text-lg font-bold text-white font-jetbrains">
        ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {d?.high && d?.low && (
        <div className="flex gap-4 mt-2 text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          <span>H&nbsp;<span className="text-white">${d.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          <span>L&nbsp;<span className="text-white">${d.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
        </div>
      )}
    </div>
  );
};

export default function PriceChart({ data = [], ticker = '', isRealData = false }) {
  if (!data.length) return null;

  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const pctChange = (currentPrice - firstPrice) / firstPrice * 100;
  const isPositive = pctChange >= 0;

  const trendColor = isPositive ? 'var(--accent-neon-green)' : 'var(--accent-neon-orange)';
  const trendHex = isPositive ? '#00ff88' : '#ff5500';

  return (
    <div className="card-noir rounded-3xl p-7 md:p-9 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl font-black text-white font-outfit tracking-tighter">{ticker}</span>
            <span className="text-[var(--text-muted)] font-light text-lg">/</span>
            <span className="text-[var(--text-secondary)] font-medium text-sm">USD</span>
            {isRealData && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--accent-neon-green)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-neon-green)] animate-neon-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="label-xs">60-Day Window</p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-white font-jetbrains leading-none">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-bold font-jetbrains mt-1.5" style={{ color: trendColor }}>
            {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendHex} stopOpacity={0.12} />
              <stop offset="100%" stopColor={trendHex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="1 8" stroke="#0e0e0e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#3a3a3a', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            dy={14}
          />
          <YAxis
            domain={[minPrice * 0.99, maxPrice * 1.01]}
            tick={{ fontSize: 9, fill: '#3a3a3a', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={68}
            tickFormatter={(v) =>
              `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            }
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#252525', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={trendHex}
            strokeWidth={1.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 3.5, fill: trendHex, stroke: '#000', strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* 60D range footer */}
      <div className="flex items-center gap-4 mt-5 pt-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <p className="label-xs mb-1">60D Low</p>
          <p className="text-sm font-bold font-jetbrains text-white">
            ${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Range bar */}
        <div className="flex-1 relative h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${((currentPrice - minPrice) / (maxPrice - minPrice)) * 100}%`,
              background: `linear-gradient(90deg, var(--accent-neon-green), ${trendHex})`,
            }}
          />
        </div>

        <div className="text-right">
          <p className="label-xs mb-1">60D High</p>
          <p className="text-sm font-bold font-jetbrains text-white">
            ${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
