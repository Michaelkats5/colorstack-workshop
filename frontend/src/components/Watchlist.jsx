/**
 * Watchlist rows: symbol, cached price/change (green/red), remove. Lives in the left panel.
 */
export default function Watchlist({
  tickers,
  selectedTicker,
  onSelectTicker,
  onRemoveTicker,
  quotesByTicker,
}) {
  const hasRows = tickers.length > 0;

  return (
    <section className="watchlist-panel-card watchlist-panel-prominent" aria-label="Watchlist">
      <h3 className="watchlist-section-heading">Watchlist</h3>
      {!hasRows ? (
        <p className="watchlist-empty">
          No symbols in your list. Use search or Add ticker below.
        </p>
      ) : (
        <ul className="watchlist-rows">
          {tickers.map((tickerSymbol) => {
            const quote = quotesByTicker[tickerSymbol];
            const price = quote?.price;
            const change = quote?.change;
            const isUp = (change ?? 0) >= 0;
            const isActive = selectedTicker === tickerSymbol;

            return (
              <li
                key={tickerSymbol}
                className={`watchlist-row ${isActive ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="watchlist-row-main"
                  onClick={() => onSelectTicker(tickerSymbol)}
                >
                  <span className="watchlist-symbol">{tickerSymbol}</span>
                  <span className="watchlist-metrics">
                    <span className="watchlist-price">
                      {price != null ? `$${Number(price).toLocaleString()}` : "—"}
                    </span>
                    <span
                      className={`watchlist-change ${change != null ? (isUp ? "up" : "down") : ""}`}
                    >
                      {change != null
                        ? `${isUp ? "+" : ""}${Number(change).toFixed(2)}%`
                        : "—"}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className="watchlist-remove"
                  onClick={() => onRemoveTicker(tickerSymbol)}
                  aria-label={`Remove ${tickerSymbol}`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
