// ── TopBar.js ─────────────────────────────────────────────────
// The header bar at the top of the main content area.
// Shows the ticker name, price, % change, today's date, and avatar.
// Receives:
//   stock  — the stock data object from Flask (or null if not loaded)
//   user   — the logged in user (for the avatar)
//   isUp   — true if stock is up, false if down (controls green/red color)

export default function TopBar({ stock, user, isUp }) {
  return (
    <header className="topbar">

      {/* Only show ticker info if stock data is loaded */}
      {stock && (
        <div className="topbar-ticker-row">
          <span className="topbar-ticker">{stock.ticker}</span>
          <span className="topbar-name">{stock.name}</span>

          {/* isUp controls the color class — "up" = green, "down" = red */}
          <span className={`topbar-price ${isUp ? "up" : "down"}`}>
            ${stock.price.toLocaleString()} {/* toLocaleString adds commas e.g. $1,234.56 */}
          </span>
          <span className={`topbar-change ${isUp ? "up" : "down"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(stock.change)}% {/* Math.abs removes the minus sign */}
          </span>
        </div>
      )}

      <div className="topbar-meta">
        {/* Format today's date as "Monday, March 26" */}
        <span className="topbar-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
        <img src={user.picture} alt="" className="topbar-avatar" />
      </div>
    </header>
  );
}
