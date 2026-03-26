// ============================================================
// PHASE 5 — Display
// File: frontend/src/components/PortfolioPanel.jsx
// ============================================================
// What this file does in plain English:
// Displays portfolio action buttons and summary metrics.
// It receives already-calculated values and only renders UI.
// ============================================================

import StockStats from "./StockStats";

const shellStyle = { border: "1px solid #e5e7eb", borderRadius: "10px", background: "#ffffff", overflow: "hidden", width: "100%", boxSizing: "border-box" };
const headerRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e5e7eb" };
const titleStyle = { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" };
const buyButtonStyle = { background: "#10b981", color: "#ffffff", border: "none", borderRadius: "5px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer" };
const sellButtonStyle = { background: "#ef4444", color: "#ffffff", border: "none", borderRadius: "5px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer" };

// PortfolioPanel receives:
// marketCap      — company market value
// volume         — today trading volume
// week52High     — highest price in last 52 weeks
// week52Low      — lowest price in last 52 weeks
// peRatio        — price-to-earnings ratio
// dividendYield  — dividend percentage
export default function PortfolioPanel({ marketCap, volume, week52High, week52Low, peRatio, dividendYield, onBuy, onSell }) {
  return (
    <div style={shellStyle}>
      <div style={headerRowStyle}>
        <span style={titleStyle}>Portfolio</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button type="button" onClick={() => onBuy && onBuy()} style={buyButtonStyle}>Buy</button>
          <button type="button" onClick={() => onSell && onSell()} style={sellButtonStyle}>Sell</button>
        </div>
      </div>

      <p style={{ fontSize: "11px", color: "#9ca3af", padding: "4px 12px 8px", margin: 0 }}>No holdings yet</p>

      <StockStats
        marketCap={marketCap}
        volume={volume}
        week52High={week52High}
        week52Low={week52Low}
        peRatio={peRatio}
        dividendYield={dividendYield}
      />
    </div>
  );
}
