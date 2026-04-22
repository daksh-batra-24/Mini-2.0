import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const IVORY = '#FDFBF7';
const FONT  = '"Times New Roman", Times, serif';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: IVORY,
        border: `1px solid ${NAVY}`,
        padding: '10px 14px',
        fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>
        ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {d?.high && d?.low && (
        <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 10, color: '#3D5275', fontWeight: 600 }}>
          <span>H&nbsp;<strong style={{ color: NAVY }}>${d.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          <span>L&nbsp;<strong style={{ color: NAVY }}>${d.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
        </div>
      )}
    </div>
  );
};

export default function PriceChart({ data = [], ticker = '', isRealData = false }) {
  if (!data.length) return null;

  const prices    = data.map(d => d.close);
  const minPrice  = Math.min(...prices);
  const maxPrice  = Math.max(...prices);
  const current   = prices[prices.length - 1];
  const first     = prices[0];
  const pctChange = (current - first) / first * 100;
  const isPos     = pctChange >= 0;

  /* Institutional color: positive = deep green, negative = crimson */
  const trendColor = isPos ? '#1A5C2E' : '#7A1515';

  return (
    <div
      style={{
        background: IVORY,
        border: `1px solid rgba(11,29,58,0.30)`,
        fontFamily: FONT,
      }}
      className="animate-fade-in-up"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '20px 28px 16px',
          borderBottom: '1px solid rgba(11,29,58,0.10)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: NAVY, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {ticker}
            </span>
            <span style={{ fontSize: 14, color: '#7A8EA8', fontWeight: 400 }}>/</span>
            <span style={{ fontSize: 13, color: '#3D5275', fontWeight: 600 }}>USD</span>
            {isRealData && (
              <span
                style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase',
                  color: '#1A5C2E', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span className="animate-neon-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#1A5C2E', display: 'inline-block' }} />
                Live Data
              </span>
            )}
          </div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8' }}>
            60-Day Window
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: NAVY }}>
            ${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, color: trendColor, marginTop: 3 }}>
            {isPos ? '+' : ''}{pctChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* ── Chart ──────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 8px 0' }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {/* Very subtle fill — just a whisper of navy tint */}
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={NAVY} stopOpacity={0.06} />
                <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Faint horizontal navy grid lines only */}
            <CartesianGrid
              strokeDasharray="0"
              stroke="rgba(11,29,58,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#7A8EA8', fontWeight: 700, fontFamily: FONT }}
              axisLine={{ stroke: 'rgba(11,29,58,0.15)' }}
              tickLine={false}
              interval="preserveStartEnd"
              dy={12}
            />
            <YAxis
              domain={[minPrice * 0.99, maxPrice * 1.01]}
              tick={{ fontSize: 9, fill: '#7A8EA8', fontWeight: 700, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
              width={70}
              tickFormatter={(v) =>
                `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(11,29,58,0.20)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            {/* Navy line, no gradient glow */}
            <Area
              type="monotone"
              dataKey="close"
              stroke={NAVY}
              strokeWidth={1.5}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{ r: 3, fill: NAVY, stroke: IVORY, strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── 60D Range Footer ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 28px',
          borderTop: '1px solid rgba(11,29,58,0.08)',
          marginTop: 8,
        }}
      >
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8' }}>
            60D Low
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginTop: 3 }}>
            ${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Range bar with current price position indicator */}
        <div style={{ flex: 1, position: 'relative', height: 2, background: 'rgba(11,29,58,0.10)' }}>
          <div
            style={{
              position: 'absolute', inset: 0, right: `${(1 - (current - minPrice) / (maxPrice - minPrice)) * 100}%`,
              background: NAVY,
            }}
          />
          {/* Current price tick */}
          <div
            style={{
              position: 'absolute',
              left: `${((current - minPrice) / (maxPrice - minPrice)) * 100}%`,
              top: -3, transform: 'translateX(-50%)',
              width: 1, height: 8,
              background: GOLD,
            }}
          />
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8' }}>
            60D High
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginTop: 3 }}>
            ${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
