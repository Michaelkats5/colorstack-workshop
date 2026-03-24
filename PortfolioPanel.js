// ── PortfolioPanel.js ─────────────────────────────────────────
// The bottom-right panel with Buy/Sell buttons and stock stats.
// Receives:
//   stock     — stock data object from Flask
//   formatCap — helper function to format market cap e.g. "$921.4B"

export default function PortfolioPanel({ stock, formatCap }) {

  // ── HELPER FUNCTIONS ──────────────────────────────────────
  // Each one checks if the value exists, returns formatted string or "N/A"

  function showVolume() {
    if (stock.volume) {
      return (stock.volume / 1e6).toFixed(2) + "M";
    } else {
      return "N/A";
    }
  }

  function showWeek52High() {
    if (stock.week_52_high) {
      return "$" + stock.week_52_high.toFixed(2);
    } else {
      return "N/A";
    }
  }

  function showWeek52Low() {
    if (stock.week_52_low) {
      return "$" + stock.week_52_low.toFixed(2);
    } else {
      return "N/A";
    }
  }

  function showPeRatio() {
    if (stock.pe_ratio) {
      return stock.pe_ratio.toFixed(2);
    } else {
      return "N/A";
    }
  }

  function showDividendYield() {
    if (stock.dividend_yield) {
      return stock.dividend_yield + "%";
    } else {
      return "—";
    }
  }

  return (
    <section className="portfolio-panel">
      <div className="portfolio-header">
        <span className="portfolio-label">PORTFOLIO</span>
        <div className="portfolio-actions">
          <button className="port-btn buy">Buy</button>
          <button className="port-btn sell">Sell</button>
        </div>
      </div>
      <p className="port-hint">No holdings yet</p>

      {/* Stats grid — all real data from Yahoo Finance via Flask */}
      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">{formatCap(stock.market_cap)}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Volume</span>
          <span className="stat-value">{showVolume()}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">52W High</span>
          <span className="stat-value up">{showWeek52High()}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">52W Low</span>
          <span className="stat-value down">{showWeek52Low()}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">P/E Ratio</span>
          <span className="stat-value">{showPeRatio()}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Dividend Yield</span>
          <span className="stat-value">{showDividendYield()}</span>
        </div>

      </div>
    </section>
  );
}
