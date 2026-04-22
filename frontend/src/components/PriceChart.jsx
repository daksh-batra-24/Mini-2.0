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
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/20">
      <p className="text-[10px] uppercase tracking-tighter font-black text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-xl font-black text-white font-jetbrains">
        ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {d?.high && d?.low && (
        <div className="flex gap-4 mt-2 text-[10px] font-bold text-[var(--text-muted)]">
          <span>H: ${d.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span>L: ${d.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
  const pctChange = ((currentPrice - firstPrice) / firstPrice * 100);
  const isPositive = pctChange >= 0;

  return (
    <div className="card-noir rounded-[32px] p-8 md:p-10 animate-fade-in-up">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 bg-white" />
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter font-outfit uppercase">
              {ticker}
              <span className="text-[var(--text-muted)] font-light ml-3 text-xl">/ PRICE</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">60-Day Window</span>
              {isRealData && (
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--accent-neon-green)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-neon-green)] animate-neon-pulse inline-block" />
                  Live Data
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-white font-jetbrains">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className="text-xs font-black font-jetbrains mt-1"
            style={{ color: isPositive ? 'var(--accent-neon-green)' : 'var(--accent-neon-orange)' }}
          >
            {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fff" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="1 6" stroke="#111" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#444', fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            dy={16}
          />
          <YAxis
            domain={[minPrice * 0.99, maxPrice * 1.01]}
            tick={{ fontSize: 9, fill: '#444', fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={72}
            tickFormatter={(v) =>
              `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            }
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a2a', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#ffffff"
            strokeWidth={1.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#ffffff', stroke: '#000', strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* 60D range bar */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border-subtle)]">
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">60D Low</p>
          <p className="text-sm font-bold font-jetbrains text-white mt-1">
            ${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex-1 mx-6 h-px bg-gradient-to-r from-[var(--accent-neon-green)] via-white/10 to-[var(--accent-neon-orange)]" />
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">60D High</p>
          <p className="text-sm font-bold font-jetbrains text-white mt-1">
            ${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
