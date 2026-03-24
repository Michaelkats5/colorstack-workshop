// ── App.js ───────────────────────────────────────────────────
// The main file — holds all the state and logic,
// then passes data down to each component to render.

import React, { useState, useEffect } from "react";
import "./App.css";

// Import each section as its own component
import LoginScreen    from "./components/LoginScreen";
import Sidebar        from "./components/Sidebar";
import LeftPanel      from "./components/LeftPanel";
import TopBar         from "./components/TopBar";
import PriceChart     from "./components/PriceChart";
import PortfolioPanel from "./components/PortfolioPanel";

// ── CONSTANTS ─────────────────────────────────────────────────
const API = "http://localhost:5000"; // Flask backend URL

const NAV_ITEMS = [
  { icon: "▦", label: "Terminal" },
  { icon: "⟁", label: "Analytics" },
  { icon: "◎", label: "Strategy" },
  { icon: "☰", label: "Archive" },
  { icon: "?", label: "Support" },
];

const TIME_RANGES = ["1W", "1M", "3M", "6M", "1Y"];


// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {

  // ── STATE ─────────────────────────────────────────────────
  const [user, setUser]               = useState(null);
  const [ticker, setTicker]           = useState("TSLA");
  const [input, setInput]             = useState("");
  const [stock, setStock]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [range, setRange]             = useState("3M");
  const [watchlist, setWatchlist]     = useState(["TSLA", "AAPL", "MSFT", "NVDA"]);
  const [news, setNews]               = useState([]);
  const [activeNav, setActiveNav]     = useState("Terminal");
  const [showWlInput, setShowWlInput] = useState(false);
  const [wlInput, setWlInput]         = useState("");

  // ── EFFECTS ───────────────────────────────────────────────

  // On startup: check if someone is already logged in
  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (!d.error) setUser(d); })
      .catch(() => {});
  }, []);

  // Every time ticker changes: fetch that stock's data
  useEffect(() => { fetchStock(ticker); }, [ticker]);

  // Every time stock changes: rebuild the news headlines
  useEffect(() => {
    if (!stock) return;
    const headlines = [
      `${stock.name} Stock Surges Amid Strong Quarterly Earnings`,
      `Analysts Raise Price Target for ${stock.ticker} Following Product Launch`,
      `${stock.name}: What Investors Need to Know This Week`,
      `${stock.ticker} Faces Headwinds as Market Volatility Increases`,
      `Institutional Investors Increase Stakes in ${stock.name}`,
      `${stock.ticker} Options Activity Signals Bullish Sentiment`,
    ];
    setNews(headlines.map(h => ({ title: h, source: "Yahoo" })));
  }, [stock]);

  // ── FUNCTIONS ─────────────────────────────────────────────

  // Fetch stock data from Flask for a given ticker
  const fetchStock = (t) => {
    setLoading(true);
    setError("");
    fetch(`${API}/api/stock/${t}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Bad response from server");
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStock(data);
      })
      .catch(() => {
        setError("Could not load stock data. Try another ticker.");
        setStock(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const t = input.trim().toUpperCase();
    setTicker(t);
    if (!watchlist.includes(t)) setWatchlist([...watchlist, t]);
    setInput("");
  };

  // Format market cap number → readable string e.g. "$3.20T"
  const formatCap = (n) => {
    if (!n) return "N/A";
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    return `$${(n / 1e6).toFixed(2)}M`;
  };

  // Slice history array to match the selected time range
  const getChartData = () => {
    if (!stock) return [];
    const days = { "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };
    return stock.history.slice(-(days[range] || 90));
  };

  const chartData = getChartData();
  const isUp = stock && stock.change >= 0;


  // ── RENDER ────────────────────────────────────────────────

  // Show login screen if nobody is logged in
  if (!user) return <LoginScreen API={API} />;

  // Otherwise show the full dashboard
  return (
    <div className="app">

      {/* Far left icon rail */}
      <Sidebar
        NAV_ITEMS={NAV_ITEMS}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        API={API}
        setUser={setUser}
      />

      {/* Left panel — search + watchlist */}
      <LeftPanel
        user={user}
        ticker={ticker}
        setTicker={setTicker}
        input={input}
        setInput={setInput}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
        showWlInput={showWlInput}
        setShowWlInput={setShowWlInput}
        wlInput={wlInput}
        setWlInput={setWlInput}
        handleSearch={handleSearch}
      />

      {/* Main content */}
      <main className="main">

        {/* Header bar */}
        <TopBar stock={stock} user={user} isUp={isUp} />

        {/* Loading + error messages */}
        {loading && <div className="state-msg">Loading {ticker}…</div>}
        {error   && <div className="state-msg error">{error}</div>}

        {/* Dashboard grid — only shows when data is ready */}
        {stock && !loading && (
          <div className="dashboard-grid">

            {/* News feed */}
            <section className="news-section">
              {news.map((item, i) => (
                <div className="news-item" key={i}>
                  <span className="news-title">{item.title}</span>
                  <span className="news-source">{item.source}</span>
                </div>
              ))}
            </section>

            {/* Price chart */}
            <PriceChart
              chartData={chartData}
              range={range}
              setRange={setRange}
              ticker={ticker}
              TIME_RANGES={TIME_RANGES}
            />

            {/* Watchlist panel — rendered inside LeftPanel, shown here in grid */}
            <section className="wl-panel">
              <div className="wl-header">
                <span className="wl-label">WATCHLIST</span>
              </div>
              {watchlist.map(t => (
                <div key={t} className={`wl-row ${ticker === t ? "active" : ""}`}>
                  <button className="wl-row-main" onClick={() => setTicker(t)}>
                    <span className="wl-row-ticker">{t}</span>
                    <span className="wl-row-arrow">→</span>
                  </button>
                  {watchlist.length > 1 && (
                    <button
                      className="wl-remove"
                      onClick={() => {
                        const updated = watchlist.filter(x => x !== t);
                        setWatchlist(updated);
                        if (ticker === t) setTicker(updated[0]);
                      }}
                    >✕</button>
                  )}
                </div>
              ))}
            </section>

            {/* Portfolio + stats */}
            <PortfolioPanel stock={stock} formatCap={formatCap} />

          </div>
        )}
      </main>
    </div>
  );
}
