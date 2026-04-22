import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * Normalize raw TA feature values to a 0–100 scale for radar display.
 * Each metric uses domain-specific scaling based on typical stock market ranges.
 */
function buildRadarData(features, currentPrice) {
  const { RSI = 50, MACD = 0, BB_Width = 0.05, BB_Pivot = 0.5, ATR = 0 } = features;

  // Sigmoid: maps any real value to 0-100 with center at 50
  const sigmoid = (x, k = 1) => 100 / (1 + Math.exp(-k * x));

  return [
    {
      metric: 'RSI',
      value: Math.max(0, Math.min(100, RSI)),
      raw: RSI.toFixed(1),
      unit: '',
      hint: RSI > 70 ? 'Overbought' : RSI < 30 ? 'Oversold' : 'Neutral',
    },
    {
      metric: 'MACD',
      value: Math.round(sigmoid(MACD, 80)),
      raw: MACD.toFixed(4),
      unit: '',
      hint: MACD > 0 ? 'Bullish momentum' : 'Bearish momentum',
    },
    {
      metric: 'Volatility',
      value: Math.round(Math.min(100, BB_Width * 600)),
      raw: BB_Width.toFixed(4),
      unit: '',
      hint: BB_Width > 0.08 ? 'High volatility' : 'Low volatility',
    },
    {
      metric: 'BB Pos',
      value: Math.round(Math.max(0, Math.min(100, BB_Pivot * 100))),
      raw: (BB_Pivot * 100).toFixed(1) + '%',
      unit: '%',
      hint: BB_Pivot > 0.8 ? 'Near upper band' : BB_Pivot < 0.2 ? 'Near lower band' : 'Mid-band',
    },
    {
      metric: 'ATR',
      value: currentPrice > 0 ? Math.round(Math.min(100, (ATR / currentPrice) * 3000)) : 50,
      raw: ATR.toFixed(2),
      unit: '$',
      hint: 'Avg True Range',
    },
  ];
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 shadow-xl">
      <p className="text-[10px] uppercase tracking-widest font-black text-[var(--text-muted)] mb-1">{d.metric}</p>
      <p className="text-lg font-black text-white font-jetbrains">{d.raw}{d.unit}</p>
      <p className="text-[10px] text-[var(--text-secondary)] mt-1">{d.hint}</p>
    </div>
  );
};

export default function FeatureRadar({ features, currentPrice }) {
  if (!features || Object.keys(features).length === 0) {
    return (
      <div className="card-noir rounded-3xl p-8 flex items-center justify-center h-64">
        <p className="text-[var(--text-muted)] text-sm">Feature data unavailable</p>
      </div>
    );
  }

  const data = buildRadarData(features, currentPrice);

  return (
    <div className="card-noir rounded-3xl p-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-white" />
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest font-outfit">
            Feature Decomposition
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest">
            TA Signal Strengths
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#1a1a1a" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 10, fill: '#666', fontWeight: 700, fontFamily: 'Inter' }}
            tickLine={false}
          />
          <Radar
            name="Signal"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={1.5}
            fill="#ffffff"
            fillOpacity={0.06}
            dot={{ r: 3, fill: '#fff', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#fff', stroke: '#000', strokeWidth: 1.5 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Metric legend with raw values */}
      <div className="grid grid-cols-5 gap-2 border-t border-[var(--border-subtle)] pt-4">
        {data.map(d => (
          <div key={d.metric} className="flex flex-col items-center gap-1 text-center">
            <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">{d.metric}</span>
            <span className="text-xs font-black text-white font-jetbrains">{d.raw}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
