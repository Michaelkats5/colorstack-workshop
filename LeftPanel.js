// ── LeftPanel.js ─────────────────────────────────────────────
// The wider left panel with branding, search box, and watchlist.
// Receives:
//   user         — logged in user object (for name + picture)
//   ticker       — currently active ticker
//   setTicker    — function to switch tickers
//   input        — current value of the search box
//   setInput     — function to update the search box
//   watchlist    — array of saved ticker strings
//   setWatchlist — function to update the watchlist
//   showWlInput  — true/false — whether the + add input is open
//   setShowWlInput — function to toggle the add input
//   wlInput      — what's typed in the watchlist add box
//   setWlInput   — function to update the watchlist add box
//   handleSearch — function that runs when the search form is submitted

export default function LeftPanel({
  user, ticker, setTicker,
  input, setInput,
  watchlist, setWatchlist,
  showWlInput, setShowWlInput,
  wlInput, setWlInput,
  handleSearch,
}) {
  return (
    <aside className="left-panel">

      {/* Branding at the top */}
      <div className="panel-brand">
        <span className="brand-name">Intelligence</span>
        <span className="brand-sub">MARKET BROAD SHEET</span>
      </div>

      {/* Search form — calls handleSearch when submitted */}
      <form onSubmit={handleSearch} className="panel-search">
        <input
          className="panel-input"
          value={input}                                         // controlled by React state
          onChange={e => setInput(e.target.value.toUpperCase())} // update on every keystroke
          placeholder="Search ticker…"
        />
        <button type="submit" className="panel-search-btn">→</button>
      </form>

      <div className="panel-section-label">Watchlist</div>

      {/* Loop through saved tickers and render a button for each */}
      <div className="panel-watchlist">
        {watchlist.map(t => (
          <button
            key={t}
            className={`panel-wl-item ${ticker === t ? "active" : ""}`} // highlight the active ticker
            onClick={() => setTicker(t)}                                  // clicking switches to this ticker
          >
            <span>{t}</span>
            {ticker === t && <span className="wl-active-dot" />} {/* blue dot next to active ticker */}
          </button>
        ))}
      </div>

      {/* Watchlist add button — + opens the input, ✕ closes it */}
      <div className="wl-header" style={{ marginTop: 8 }}>
        <span className="wl-label">ADD TICKER</span>
        <button
          className={`wl-add ${showWlInput ? "open" : ""}`}
          onClick={() => { setShowWlInput(!showWlInput); setWlInput(""); }}
        >
          {showWlInput ? "✕" : "+"}
        </button>
      </div>

      {/* Expandable input — only shows when showWlInput is true */}
      {showWlInput && (
        <form
          className="wl-add-row"
          onSubmit={e => {
            e.preventDefault();
            const t = wlInput.trim().toUpperCase();
            if (t && !watchlist.includes(t)) {
              setWatchlist([...watchlist, t]); // copy the list and add the new ticker
              setTicker(t);                    // switch to it immediately
            }
            setWlInput("");
            setShowWlInput(false); // close the input after adding
          }}
        >
          <input
            className="wl-input"
            value={wlInput}
            onChange={e => setWlInput(e.target.value.toUpperCase())}
            placeholder="e.g. GOOG"
            autoFocus   // automatically focus this field when it appears
            maxLength={5} // tickers are max 5 characters
          />
          <button type="submit" className="wl-submit">Add</button>
        </form>
      )}

      {/* User profile at the bottom — picture and name from Google */}
      <div className="panel-user">
        <img src={user.picture} alt={user.name} className="panel-avatar" />
        <div className="panel-user-info">
          <span className="panel-user-name">{user.name.split(" ")[0]}</span> {/* first name only */}
          <span className="panel-user-email">{user.email}</span>
        </div>
      </div>

      <button className="upgrade-btn">Upgrade to Pro</button>
    </aside>
  );
}
