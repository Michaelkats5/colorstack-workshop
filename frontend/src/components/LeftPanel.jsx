// ============================================================
// PHASE 1 ? User Input
// File: frontend/src/components/LeftPanel.jsx
// ============================================================
// What this file does in plain English:
// This is where the user types a ticker and submits search.
// It also shows watchlist + news and lets the user add/remove
// tickers before data fetch starts in useStockData.js.
// ============================================================

import NewsSection from "./NewsSection";
import Watchlist from "./Watchlist";

// This function adds a ticker from the add-row form.
function addTickerFromInput(watchlistInputValue, watchlist, setWatchlist, setTicker) {
  const newTicker = watchlistInputValue.trim().toUpperCase();
  if (!newTicker) return;
  if (watchlist.includes(newTicker)) return;
  setWatchlist([...watchlist, newTicker]);
  setTicker(newTicker);
}

export default function LeftPanel({
  user,
  ticker,
  setTicker,
  input,
  setInput,
  watchlist,
  setWatchlist,
  showWlInput,
  setShowWlInput,
  wlInput,
  setWlInput,
  handleSearch,
  articles,
  quoteSnapshots,
  onRemoveWatchlistTicker,
}) {
  return (
    <aside className="left-panel">
      <div className="panel-brand">
        <span className="brand-name">Intelligence</span>
        <span className="brand-sub">MARKET BROAD SHEET</span>
      </div>

      <form onSubmit={handleSearch} className="panel-search">
        <input
          className="panel-input"
          value={input}
          onChange={(event) => setInput(event.target.value.toUpperCase())}
          placeholder="Search ticker..."
        />
        <button type="submit" className="panel-search-btn">-&gt;</button>
      </form>

      <div className="left-panel-feed">
        <Watchlist
          tickers={watchlist}
          selectedTicker={ticker}
          onSelectTicker={setTicker}
          onRemoveTicker={onRemoveWatchlistTicker}
          quotesByTicker={quoteSnapshots}
        />
        <div className="left-panel-divider" aria-hidden="true" />
        <NewsSection articles={articles} title="Latest News" />
      </div>

      <div className="wl-header">
        <span className="wl-label">ADD TICKER</span>
        <button
          type="button"
          className={`wl-add ${showWlInput ? "open" : ""}`}
          onClick={() => {
            setShowWlInput(!showWlInput);
            setWlInput("");
          }}
        >
          {showWlInput ? "x" : "+"}
        </button>
      </div>

      {showWlInput && (
        <form
          className="wl-add-row"
          onSubmit={(event) => {
            event.preventDefault();
            addTickerFromInput(wlInput, watchlist, setWatchlist, setTicker);
            setWlInput("");
            setShowWlInput(false);
          }}
        >
          <input
            className="wl-input"
            value={wlInput}
            onChange={(event) => setWlInput(event.target.value.toUpperCase())}
            placeholder="e.g. GOOG"
            autoFocus
            maxLength={5}
          />
          <button type="submit" className="wl-submit">Add</button>
        </form>
      )}

      <div className="panel-user">
        <img src={user.picture} alt={user.name} className="panel-avatar" />
        <div className="panel-user-info">
          <span className="panel-user-name">{user.name.split(" ")[0]}</span>
          <span className="panel-user-email">{user.email}</span>
        </div>
      </div>

      <button type="button" className="upgrade-btn">Upgrade to Pro</button>
    </aside>
  );
}
