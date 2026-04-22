import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

function buildRadarData(features, currentPrice) {
  const { RSI = 50, MACD = 0, BB_Width = 0.05, BB_Pivot = 0.5, ATR = 0 } = features;
  const sigmoid = (x, k = 1) => 100 / (1 + Math.exp(-k * x));

  return [
    {
      metric: 'RSI',
      value: Math.max(0, Math.min(100, RSI)),
      raw: RSI.toFixed(1),
      hint: RSI > 70 ? 'Overbought' : RSI < 30 ? 'Oversold' : 'Neutral',
    },
    {
      metric: 'MACD',
      value: Math.round(sigmoid(MACD, 80)),
      raw: MACD.toFixed(4),
      hint: MACD > 0 ? 'Bullish momentum' : 'Bearish momentum',
    },
    {
      metric: 'Volatility',
      value: Math.round(Math.min(100, BB_Width * 600)),
      raw: BB_Width.toFixed(4),
      hint: BB_Width > 0.08 ? 'High volatility' : 'Low volatility',
    },
    {
      metric: 'BB Pos',
      value: Math.round(Math.max(0, Math.min(100, BB_Pivot * 100))),
      raw: (BB_Pivot * 100).toFixed(1) + '%',
      hint: BB_Pivot > 0.8 ? 'Near upper band' : BB_Pivot < 0.2 ? 'Near lower band' : 'Mid-band',
    },
    {
      metric: 'ATR',
      value: currentPrice > 0 ? Math.round(Math.min(100, (ATR / currentPrice) * 3000)) : 50,
      raw: '$' + ATR.toFixed(2),
      hint: 'Avg True Range',
    },
  ];
}

/* Color a value 0-100 on a green→yellow→orange scale */
function signalColor(value) {
  if (value < 35) return 'var(--accent-neon-green)';
  if (value < 65) return 'var(--text-secondary)';
  return 'var(--accent-neon-orange)';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      className="rounded-xl border px-4 py-3 shadow-2xl"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-accent)' }}
    >
      <p className="label-xs mb-1.5">{d.metric}</p>
      <p className="text-base font-black text-white font-jetbrains">{d.raw}</p>
      <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{d.hint}</p>
    </div>
  );
};

export default function FeatureRadar({ features, currentPrice }) {
  if (!features || Object.keys(features).length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center h-64 border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Feature data unavailable</p>
      </div>
    );
  }

  const data = buildRadarData(features, currentPrice);

  return (
    <div
      className="rounded-2xl p-6 border flex flex-col gap-5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest font-outfit">
            Feature Decomposition
          </h3>
          <p className="label-xs mt-0.5">TA Signal Strengths · Normalized 0–100</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
          <PolarGrid stroke="#161616" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 9, fill: '#555', fontWeight: 700, fontFamily: 'Inter' }}
            tickLine={false}
          />
          <Radar
            name="Signal"
            dataKey="value"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
            fill="rgba(255,255,255,1)"
            fillOpacity={0.04}
            dot={{ r: 2.5, fill: '#fff', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#fff', stroke: '#000', strokeWidth: 1 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Metric legend */}
      <div
        className="grid grid-cols-5 gap-2 pt-4 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {data.map(d => (
          <div key={d.metric} className="flex flex-col items-center gap-1 text-center">
            <span className="label-xs">{d.metric}</span>
            <span
              className="text-[11px] font-black font-jetbrains"
              style={{ color: signalColor(d.value) }}
            >
              {d.raw}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
