// App.jsx — workshop dashboard: yfinance via Flask, no session / Google OAuth.
// GOOGLE OAUTH — not used in workshop version
// Uncomment LoginScreen + auth effects below to re-enable Google login UI
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

// import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import LeftPanel from "./components/LeftPanel";
import TopBar from "./components/TopBar";
import PriceChart from "./components/PriceChart";
import PortfolioPanel from "./components/PortfolioPanel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Fixed user shown in workshop mode (no OAuth). */
const WORKSHOP_USER = {
  name: "Workshop User",
  email: "workshop@colorstack.org",
  picture: "https://ui-avatars.com/api/?name=Workshop+User&background=2563eb&color=fff",
};

const NAV_ITEMS = [
  { icon: "▦", label: "Terminal" },
  { icon: "⟁", label: "Analytics" },
  { icon: "◎", label: "Strategy" },
  { icon: "☰", label: "Archive" },
  { icon: "?", label: "Support" },
];

const TIME_RANGES = ["1W", "1M", "3M", "6M", "1Y"];

export default function App() {
  const [currentUser] = useState(WORKSHOP_USER);
  const [selectedTicker, setSelectedTicker] = useState("TSLA");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockData, setStockData] = useState(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState("");
  const [selectedRange, setSelectedRange] = useState("3M");
  const [watchlistTickers, setWatchlistTickers] = useState(["TSLA", "AAPL", "MSFT", "NVDA"]);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [activeNavigation, setActiveNavigation] = useState("Terminal");
  const [isWatchlistInputVisible, setIsWatchlistInputVisible] = useState(false);
  const [watchlistInputValue, setWatchlistInputValue] = useState("");

  // GOOGLE OAUTH — not used in workshop version
  // useEffect(() => {
  //   fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
  //     .then((r) => r.json())
  //     .then((d) => { if (!d.error) setCurrentUser(d); })
  //     .catch(() => {});
  // }, []);

  /**
   * Loads quote + history from Flask (two endpoints) and merges into one stock object.
   */
  const fetchStockData = useCallback((tickerSymbol) => {
    setIsLoadingStock(true);
    setStockError("");

    Promise.all([
      fetch(`${API_BASE_URL}/api/stock/${tickerSymbol}`),
      fetch(`${API_BASE_URL}/api/stock/${tickerSymbol}/history`),
    ])
      .then(([quoteRes, histRes]) =>
        Promise.all([quoteRes.json(), histRes.json()]).then(([quote, hist]) => {
          if (!quoteRes.ok) throw new Error(quote.error || "Quote request failed");
          if (!histRes.ok) throw new Error(hist.error || "History request failed");
          if (quote.error) throw new Error(quote.error);
          setStockData({ ...quote, history: hist.history || [] });
        })
      )
      .catch(() => {
        setStockError("Could not load stock data. Try another ticker.");
        setStockData(null);
      })
      .finally(() => {
        setIsLoadingStock(false);
      });
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const normalizedTicker = searchQuery.trim().toUpperCase();
    if (!normalizedTicker) return;

    setSelectedTicker(normalizedTicker);
    setWatchlistTickers((currentTickers) =>
      currentTickers.includes(normalizedTicker)
        ? currentTickers
        : [...currentTickers, normalizedTicker]
    );
    setSearchQuery("");
  };

  const formatMarketCap = (marketCapValue) => {
    if (!marketCapValue) return "N/A";
    if (marketCapValue >= 1e12) return `$${(marketCapValue / 1e12).toFixed(2)}T`;
    if (marketCapValue >= 1e9) return `$${(marketCapValue / 1e9).toFixed(2)}B`;
    return `$${(marketCapValue / 1e6).toFixed(2)}M`;
  };

  const buildNewsFromStock = (latestStockData) => {
    if (!latestStockData) return [];
    const generatedHeadlines = [
      `${latestStockData.name} Stock Surges Amid Strong Quarterly Earnings`,
      `Analysts Raise Price Target for ${latestStockData.ticker} Following Product Launch`,
      `${latestStockData.name}: What Investors Need to Know This Week`,
      `${latestStockData.ticker} Faces Headwinds as Market Volatility Increases`,
      `Institutional Investors Increase Stakes in ${latestStockData.name}`,
      `${latestStockData.ticker} Options Activity Signals Bullish Sentiment`,
    ];
    return generatedHeadlines.map((headline) => ({ title: headline, source: "Yahoo" }));
  };

  const getChartDataForRange = useCallback(() => {
    if (!stockData || !stockData.history) return [];
    const rangeToDaysMap = { "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };
    return stockData.history.slice(-(rangeToDaysMap[selectedRange] || 90));
  }, [selectedRange, stockData]);

  useEffect(() => {
    fetchStockData(selectedTicker);
  }, [fetchStockData, selectedTicker]);

  useEffect(() => {
    setNewsHeadlines(buildNewsFromStock(stockData));
  }, [stockData]);

  const chartData = useMemo(() => getChartDataForRange(), [getChartDataForRange]);
  const isPriceUp = !!stockData && stockData.change >= 0;

  // GOOGLE OAUTH — not used in workshop version
  // if (!currentUser) return <LoginScreen API={API_BASE_URL} />;

  return (
    <div className="app">
      <Sidebar
        NAV_ITEMS={NAV_ITEMS}
        activeNav={activeNavigation}
        setActiveNav={setActiveNavigation}
      />

      <LeftPanel
        user={currentUser}
        ticker={selectedTicker}
        setTicker={setSelectedTicker}
        input={searchQuery}
        setInput={setSearchQuery}
        watchlist={watchlistTickers}
        setWatchlist={setWatchlistTickers}
        showWlInput={isWatchlistInputVisible}
        setShowWlInput={setIsWatchlistInputVisible}
        wlInput={watchlistInputValue}
        setWlInput={setWatchlistInputValue}
        handleSearch={handleSearchSubmit}
      />

      <main className="main">
        <TopBar stock={stockData} user={currentUser} isUp={isPriceUp} />

        {isLoadingStock && <div className="state-msg">Loading {selectedTicker}...</div>}
        {stockError && <div className="state-msg error">{stockError}</div>}

        {stockData && !isLoadingStock && (
          <div className="dashboard-grid">
            <section className="news-section">
              {newsHeadlines.map((item, i) => (
                <div className="news-item" key={i}>
                  <span className="news-title">{item.title}</span>
                  <span className="news-source">{item.source}</span>
                </div>
              ))}
            </section>

            <PriceChart
              chartData={chartData}
              range={selectedRange}
              setRange={setSelectedRange}
              ticker={selectedTicker}
              TIME_RANGES={TIME_RANGES}
            />

            <section className="wl-panel">
              <div className="wl-header">
                <span className="wl-label">WATCHLIST</span>
              </div>
              {watchlistTickers.map((tickerSymbol) => (
                <div key={tickerSymbol} className={`wl-row ${selectedTicker === tickerSymbol ? "active" : ""}`}>
                  <button className="wl-row-main" onClick={() => setSelectedTicker(tickerSymbol)}>
                    <span className="wl-row-ticker">{tickerSymbol}</span>
                    <span className="wl-row-arrow">→</span>
                  </button>
                  {watchlistTickers.length > 1 && (
                    <button
                      className="wl-remove"
                      onClick={() => {
                        const updatedTickers = watchlistTickers.filter((existingTicker) => existingTicker !== tickerSymbol);
                        setWatchlistTickers(updatedTickers);
                        if (selectedTicker === tickerSymbol && updatedTickers[0]) setSelectedTicker(updatedTickers[0]);
                      }}
                    >✕</button>
                  )}
                </div>
              ))}
            </section>

            <PortfolioPanel stock={stockData} formatCap={formatMarketCap} />
          </div>
        )}
      </main>
    </div>
  );
}
