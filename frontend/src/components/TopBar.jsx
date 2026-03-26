// ============================================================
// PHASE 1 ? User Input
// File: frontend/src/components/TopBar.jsx
// ============================================================
// What this file does in plain English:
// Displays the currently selected stock quote and user identity.
// It reacts to ticker changes that start from user input.
// ============================================================

// This helper adds a market-state suffix to the quote timestamp line.
function getMarketStateSuffix(marketState) {
  if (marketState === "PRE") return " · Pre-market";
  if (marketState === "POST") return " · After hours";
  if (marketState === "CLOSED") return " · Market closed";
  return "";
}

// This helper builds one readable line like "As of ..." for the header.
function buildQuoteAsOfLine(quoteTimeIso, exchangeTimezone, marketState) {
  if (!quoteTimeIso) {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  const parsedDate = new Date(quoteTimeIso);
  const datePart = parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: exchangeTimezone || undefined,
  });
  const timePart = parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: exchangeTimezone || undefined,
  });
  return `As of ${datePart} · ${timePart}${getMarketStateSuffix(marketState)}`;
}

export default function TopBar({
  symbol,
  name,
  price,
  change,
  quoteTimeIso,
  exchangeTimezone,
  marketState,
  user,
  isPriceUp,
}) {
  const hasQuote = symbol !== null && price !== null;
  const safeChange = change == null ? 0 : Number(change);

  return (
    <header className="topbar top-bar">
      {hasQuote && (
        <div className="topbar-ticker-row">
          <span className="topbar-ticker">{symbol}</span>
          <span className="topbar-name">{name}</span>
          <span className={`topbar-price ${isPriceUp ? "up" : "down"}`}>
            ${Number(price).toLocaleString()}
          </span>
          <span className={`topbar-change ${isPriceUp ? "up" : "down"}`}>
            {isPriceUp ? "UP" : "DOWN"} {Math.abs(safeChange)}%
          </span>
        </div>
      )}

      <div className="topbar-meta">
        <div className="topbar-quote-block">
          <span className="topbar-date" title={hasQuote ? "Quote time from Yahoo Finance" : undefined}>
            {buildQuoteAsOfLine(quoteTimeIso, exchangeTimezone, marketState)}
          </span>
        </div>
        <div className="topbar-user" title={user.name}>
          <div className="topbar-user-text">
            <span className="topbar-user-name">{user.name}</span>
            <span className="topbar-user-email">{user.email}</span>
          </div>
          <img src={user.picture} alt="" className="topbar-avatar" />
        </div>
      </div>
    </header>
  );
}
