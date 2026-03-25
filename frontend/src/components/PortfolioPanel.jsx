import StockStats from "./StockStats";

/**
 * Portfolio shell: actions row plus key stats (stats are live from Flask / Yahoo).
 */
export default function PortfolioPanel({
  marketCap,
  volume,
  week52High,
  week52Low,
  peRatio,
  dividendYield,
}) {
  return (
    <section className="portfolio-panel portfolio-section">
      <div className="portfolio-header">
        <span className="portfolio-label">PORTFOLIO</span>
        <div className="portfolio-actions">
          <button type="button" className="port-btn buy">
            Buy
          </button>
          <button type="button" className="port-btn sell">
            Sell
          </button>
        </div>
      </div>
      <p className="portfolio-empty">No holdings yet</p>

      <StockStats
        marketCap={marketCap}
        volume={volume}
        week52High={week52High}
        week52Low={week52Low}
        peRatio={peRatio}
        dividendYield={dividendYield}
      />
    </section>
  );
}
