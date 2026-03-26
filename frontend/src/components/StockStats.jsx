// ============================================================
// PHASE 5 — Display
// File: frontend/src/components/StockStats.jsx
// ============================================================
// What this file does in plain English:
// Renders six simple stat cards (market cap, volume, highs/lows).
// It formats values for display and shows a dash when missing.
// ============================================================

import { formatMarketCap, formatPrice, formatVolume } from "../utils/formatters";

const gridStyle = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px", padding: "0 10px 10px 10px", width: "100%", boxSizing: "border-box" };

// This helper builds one stat tile with label + value.
function StatCard({ label, value }) {
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 10px", minWidth: 0, boxSizing: "border-box" }}>
      <p style={{ fontSize: "9px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", color: "#9ca3af", margin: "0 0 2px 0" }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: "700", color: "#111827", margin: 0, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</p>
    </div>
  );
}

// This helper returns a display string or "—" when value is missing.
function safeDisplay(value, formatter) {
  if (value === null || value === undefined || value === "") return "—";
  return formatter(value);
}

export default function StockStats({ marketCap, volume, week52High, week52Low, peRatio, dividendYield }) {
  const marketCapText = safeDisplay(marketCap, formatMarketCap);
  const volumeText = safeDisplay(volume, formatVolume);
  const week52HighText = safeDisplay(week52High, formatPrice);
  const week52LowText = safeDisplay(week52Low, formatPrice);
  const peRatioText = safeDisplay(peRatio, (value) => Number(value).toFixed(2));
  const dividendYieldText = safeDisplay(dividendYield, (value) => `${value}%`);

  return (
    <div style={gridStyle} className="stats-grid">
      <StatCard label="Market Cap" value={marketCapText} />
      <StatCard label="Volume" value={volumeText} />
      <StatCard label="52W High" value={week52HighText} />
      <StatCard label="52W Low" value={week52LowText} />
      <StatCard label="P/E Ratio" value={peRatioText} />
      <StatCard label="Div Yield" value={dividendYieldText} />
    </div>
  );
}
