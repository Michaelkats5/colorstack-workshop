/**
 * Main content header: symbol, price, change, Yahoo quote time, user avatar.
 */

/** Human-readable suffix for Yahoo marketState (PRE / POST / CLOSED). */
function getMarketStateSuffix(marketState) {
  if (marketState === "PRE") return " · Pre-market";
  if (marketState === "POST") return " · After hours";
  if (marketState === "CLOSED") return " · Market closed";
  return "";
}

/** One line describing when the quote was valid (exchange-local time). */
function buildQuoteAsOfLine(quoteTimeIso, exchangeTimezone, marketState) {
  if (!quoteTimeIso) {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
  const parsed = new Date(quoteTimeIso);
  const timeZone = exchangeTimezone || undefined;
  const datePart = parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  });
  const timePart = parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
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
  const hasQuote = symbol != null && price != null;

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
            {isPriceUp ? "▲" : "▼"} {Math.abs(change ?? 0)}%
          </span>
        </div>
      )}

      <div className="topbar-meta">
        <div className="topbar-quote-block">
          <span
            className="topbar-date"
            title={hasQuote ? "Quote time from Yahoo Finance" : undefined}
          >
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
