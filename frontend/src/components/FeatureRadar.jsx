import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const NAVY  = '#0B1D3A';
const GOLD  = '#C5A028';
const IVORY = '#FDFBF7';
const FONT  = '"Times New Roman", Times, serif';

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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: IVORY, border: `1px solid ${NAVY}`,
        padding: '10px 14px', fontFamily: FONT,
      }}
    >
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8', marginBottom: 4 }}>
        {d.metric}
      </p>
      <p style={{ fontSize: 16, fontWeight: 900, color: NAVY }}>{d.raw}</p>
      <p style={{ fontSize: 10, color: '#3D5275', marginTop: 4 }}>{d.hint}</p>
    </div>
  );
};

export default function FeatureRadar({ features, currentPrice }) {
  if (!features || Object.keys(features).length === 0) {
    return (
      <div
        style={{
          background: '#F3F1EB', border: `1px solid rgba(11,29,58,0.15)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 240, fontFamily: FONT,
        }}
      >
        <p style={{ fontSize: 12, color: '#7A8EA8' }}>Feature data unavailable</p>
      </div>
    );
  }

  const data = buildRadarData(features, currentPrice);

  return (
    <div
      style={{
        background: '#F3F1EB',
        border: `1px solid rgba(11,29,58,0.15)`,
        padding: '20px 20px 16px',
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <h3
          style={{
            fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: NAVY,
          }}
        >
          Feature Decomposition
        </h3>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A8EA8', marginTop: 3 }}>
          TA Signal Strengths · Normalised 0–100
        </p>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <RadarChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>

          {/* Navy grid web */}
          <PolarGrid stroke={NAVY} strokeWidth={0.5} strokeOpacity={0.18} />

          <PolarAngleAxis
            dataKey="metric"
            tick={{
              fontSize: 9, fill: '#3D5275', fontWeight: 700,
              fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
            tickLine={false}
          />

          {/* Gold polygon — translucent gold fill, solid gold border */}
          <Radar
            name="Signal"
            dataKey="value"
            stroke={GOLD}
            strokeWidth={1.5}
            fill={GOLD}
            fillOpacity={0.18}
            dot={{ r: 2.5, fill: GOLD, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: GOLD, stroke: IVORY, strokeWidth: 1.5 }}
          />

          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend row */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          borderTop: `1px solid rgba(11,29,58,0.12)`, paddingTop: 12, marginTop: 4,
        }}
      >
        {data.map(d => (
          <div key={d.metric} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7A8EA8' }}>
              {d.metric}
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: NAVY }}>
              {d.raw}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
