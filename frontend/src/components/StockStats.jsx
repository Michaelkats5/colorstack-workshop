import { formatMarketCap, formatPrice, formatVolume } from "../utils/formatters";

const cardStyle = {
  background: "#f8f9fa",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "8px 12px",
  minWidth: 0,
};

const labelStyle = {
  fontSize: "10px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6b7280",
  marginBottom: "2px",
  marginTop: 0,
};

const valueStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "14px",
  fontWeight: "700",
  color: "#111827",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  margin: 0,
};

/**
 * Six stat cards: market cap, volume, 52W range, P/E, dividend yield.
 * Props match PortfolioPanel (week52High / week52Low).
 */
export default function StockStats({
  marketCap,
  volume,
  week52High,
  week52Low,
  peRatio,
  dividendYield,
}) {
  const peDisplay =
    peRatio != null ? Number(peRatio).toFixed(2) : "—";
  const divDisplay =
    dividendYield != null ? `${dividendYield}%` : "—";

  return (
    <div className="stats-grid">
      <div style={cardStyle}>
        <p style={labelStyle}>Market Cap</p>
        <p style={valueStyle}>{formatMarketCap(marketCap)}</p>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>Volume</p>
        <p style={valueStyle}>{formatVolume(volume)}</p>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>52W High</p>
        <p style={valueStyle}>{formatPrice(week52High)}</p>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>52W Low</p>
        <p style={valueStyle}>{formatPrice(week52Low)}</p>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>P/E Ratio</p>
        <p style={valueStyle}>{peDisplay}</p>
      </div>

      <div style={cardStyle}>
        <p style={labelStyle}>Div Yield</p>
        <p style={valueStyle}>{divDisplay}</p>
      </div>
    </div>
  );
}
