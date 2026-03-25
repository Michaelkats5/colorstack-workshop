/**
 * Watchlist rows: ticker left, price + change stacked right, remove on far right.
 */
export default function Watchlist({
  tickers,
  selectedTicker,
  onSelectTicker,
  onRemoveTicker,
  quotesByTicker,
}) {
  const hasRows = tickers.length > 0;

  const rowShellStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: isActive ? "1px solid #2563eb" : "1px solid #e5e7eb",
    marginBottom: "8px",
    background: isActive ? "#eff6ff" : "#ffffff",
    minWidth: 0,
  });

  const mainBtnStyle = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: 0,
    margin: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  };

  const removeBtnStyle = {
    flexShrink: 0,
    alignSelf: "stretch",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    fontSize: "16px",
    lineHeight: 1,
    cursor: "pointer",
    borderRadius: "6px",
  };

  return (
    <section className="watchlist-panel-card watchlist-panel-prominent" aria-label="Watchlist">
      <h3 className="watchlist-section-heading">Watchlist</h3>
      {!hasRows ? (
        <p className="watchlist-empty">
          No symbols in your list. Use search or Add ticker below.
        </p>
      ) : (
        <ul className="watchlist-rows watchlist-rows-reset">
          {tickers.map((tickerSymbol) => {
            const quote = quotesByTicker[tickerSymbol];
            const price = quote?.price;
            const change = quote?.change;
            const isUp = (change ?? 0) >= 0;
            const isActive = selectedTicker === tickerSymbol;
            const priceStr =
              price != null ? `$${Number(price).toLocaleString()}` : "—";
            const changeStr =
              change != null
                ? `${isUp ? "+" : ""}${Number(change).toFixed(2)}%`
                : "—";

            return (
              <li key={tickerSymbol} className="watchlist-row-item">
                <div style={rowShellStyle(isActive)}>
                  <button
                    type="button"
                    style={mainBtnStyle}
                    onClick={() => onSelectTicker(tickerSymbol)}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#3b82f6",
                        flexShrink: 0,
                      }}
                    >
                      {tickerSymbol}
                    </span>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          margin: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: "#111827",
                        }}
                      >
                        {priceStr}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          margin: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isUp ? "#10b981" : "#ef4444",
                        }}
                      >
                        {changeStr}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    style={removeBtnStyle}
                    onClick={() => onRemoveTicker(tickerSymbol)}
                    aria-label={`Remove ${tickerSymbol}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
