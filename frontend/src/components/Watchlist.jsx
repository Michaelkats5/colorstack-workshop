// ============================================================
// PHASE 5 ? Display
// File: frontend/src/components/Watchlist.jsx
// ============================================================
// What this file does in plain English:
// Renders ticker rows in the watchlist with price/change values.
// Lets user select a ticker row or remove it from the list.
// ============================================================

// This helper returns display values for one watchlist row.
function buildWatchlistTexts(quoteData) {
  if (!quoteData) return { priceText: "--", changeText: "--", isUp: true };
  const priceText = quoteData.price != null ? `$${Number(quoteData.price).toLocaleString()}` : "--";
  const changeNumber = quoteData.change != null ? Number(quoteData.change) : null;
  const isUp = changeNumber == null ? true : changeNumber >= 0;
  const changeText = changeNumber == null ? "--" : `${isUp ? "+" : ""}${changeNumber.toFixed(2)}%`;
  return { priceText, changeText, isUp };
}

// This helper builds shell style for active vs inactive row.
function rowShellStyle(isActive) {
  return {
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
  };
}

export default function Watchlist({ tickers, selectedTicker, onSelectTicker, onRemoveTicker, quotesByTicker }) {
  const hasRows = tickers.length > 0;

  return (
    <section className="watchlist-panel-card watchlist-panel-prominent" aria-label="Watchlist">
      <h3 className="watchlist-section-heading">Watchlist</h3>
      {!hasRows ? (
        <p className="watchlist-empty">No symbols in your list. Use search or Add ticker below.</p>
      ) : (
        <ul className="watchlist-rows watchlist-rows-reset">
          {tickers.map((tickerSymbol) => {
            const quoteData = quotesByTicker[tickerSymbol];
            const { priceText, changeText, isUp } = buildWatchlistTexts(quoteData);
            const isActive = selectedTicker === tickerSymbol;

            return (
              <li key={tickerSymbol} className="watchlist-row-item">
                <div style={rowShellStyle(isActive)}>
                  <button
                    type="button"
                    style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: 0, margin: 0, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                    onClick={() => onSelectTicker(tickerSymbol)}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6", flexShrink: 0 }}>{tickerSymbol}</span>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: "700", margin: 0, fontFamily: "'JetBrains Mono', monospace", color: "#111827" }}>{priceText}</p>
                      <p style={{ fontSize: "12px", fontWeight: "600", margin: 0, fontFamily: "'JetBrains Mono', monospace", color: isUp ? "#10b981" : "#ef4444" }}>{changeText}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    style={{ flexShrink: 0, alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", border: "none", background: "transparent", color: "#9ca3af", fontSize: "16px", lineHeight: 1, cursor: "pointer", borderRadius: "6px" }}
                    onClick={() => onRemoveTicker(tickerSymbol)}
                    aria-label={`Remove ${tickerSymbol}`}
                  >
                    x
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
