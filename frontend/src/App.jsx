import React, { useCallback, useEffect, useMemo, useState } from "react";

import { fetchStockQuote } from "./api/stockClient";
import { getChartDataForRange } from "./chartRangeUtils";
import LeftPanel from "./components/LeftPanel";
import PortfolioPanel from "./components/PortfolioPanel";
import Sidebar from "./components/Sidebar";
import StockChart from "./components/StockChart";
import TopBar from "./components/TopBar";
import { buildNewsHeadlines } from "./utils/newsUtils";

import "./App.css";

/** Workshop demo user (shown when Google OAuth is off). */
const WORKSHOP_USER = {
  name: "Workshop User",
  email: "workshop@colorstack.org",
  picture:
    "https://ui-avatars.com/api/?name=Workshop+User&background=2563eb&color=fff",
};

const NAVIGATION_ITEMS = [
  { icon: "▦", label: "Terminal" },
  { icon: "⟁", label: "Analytics" },
  { icon: "◎", label: "Strategy" },
  { icon: "☰", label: "Archive" },
  { icon: "?", label: "Support" },
];

/** Buttons on the price chart (calendar windows; see chartRangeUtils). */
const CHART_TIME_RANGES = ["1W", "1M", "3M", "6M", "1Y", "5Y", "10Y"];

/** How often to silently refresh the active quote while the tab is open (ms). */
const STOCK_POLL_INTERVAL_MS = 45_000;

export default function App() {
  const [currentUser] = useState(WORKSHOP_USER);
  const [selectedTicker, setSelectedTicker] = useState("TSLA");
  const [searchQuery, setSearchQuery] = useState("");
  const [stock, setStock] = useState(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState("");
  const [selectedRange, setSelectedRange] = useState("3M");
  const [watchlistTickers, setWatchlistTickers] = useState([
    "TSLA",
    "AAPL",
    "MSFT",
    "NVDA",
  ]);
  /** Last known price/change per symbol (for left-panel watchlist rows). */
  const [quoteSnapshots, setQuoteSnapshots] = useState({});
  const [activeNavigation, setActiveNavigation] = useState("Terminal");
  const [isWatchlistInputVisible, setIsWatchlistInputVisible] = useState(false);
  const [watchlistInputValue, setWatchlistInputValue] = useState("");

  const loadStock = useCallback(async (tickerSymbol, options = {}) => {
    const silent = options.silent === true;
    if (!silent) {
      setIsLoadingStock(true);
      setStockError("");
    }
    try {
      const data = await fetchStockQuote(tickerSymbol);
      setStock(data);
    } catch (err) {
      if (!silent) {
        setStockError(
          err instanceof Error
            ? err.message
            : "Could not load stock data. Try another ticker."
        );
        setStock(null);
      }
    } finally {
      if (!silent) {
        setIsLoadingStock(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStock(selectedTicker);
  }, [loadStock, selectedTicker]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadStock(selectedTicker, { silent: true });
    }, STOCK_POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadStock, selectedTicker]);

  useEffect(() => {
    if (stock?.symbol != null) {
      setQuoteSnapshots((previous) => ({
        ...previous,
        [stock.symbol]: {
          price: stock.price,
          change: stock.change,
        },
      }));
    }
  }, [stock]);

  const newsItems = useMemo(
    () =>
      stock ? buildNewsHeadlines(stock.name, stock.symbol) : [],
    [stock]
  );

  const chartData = useMemo(
    () => getChartDataForRange(stock?.history, selectedRange),
    [stock, selectedRange]
  );

  const isPriceUp = Boolean(stock) && (stock.change ?? 0) >= 0;

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

  const handleRemoveWatchlistTicker = (tickerSymbol) => {
    setWatchlistTickers((previousTickers) => {
      const nextTickers = previousTickers.filter(
        (item) => item !== tickerSymbol
      );
      if (selectedTicker === tickerSymbol && nextTickers.length > 0) {
        setSelectedTicker(nextTickers[0]);
      }
      return nextTickers;
    });
    setQuoteSnapshots((previous) => {
      const next = { ...previous };
      delete next[tickerSymbol];
      return next;
    });
  };

  return (
    <div className="app">
      <Sidebar
        navigationItems={NAVIGATION_ITEMS}
        activeNav={activeNavigation}
        onNavChange={setActiveNavigation}
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
        articles={newsItems}
        quoteSnapshots={quoteSnapshots}
        onRemoveWatchlistTicker={handleRemoveWatchlistTicker}
      />

      <main className="main">
        <TopBar
          symbol={stock?.symbol ?? null}
          name={stock?.name ?? null}
          price={stock?.price ?? null}
          change={stock?.change ?? null}
          quoteTimeIso={stock?.quote_time_iso ?? null}
          exchangeTimezone={stock?.exchange_timezone ?? null}
          marketState={stock?.market_state ?? null}
          user={currentUser}
          isPriceUp={isPriceUp}
        />

        {isLoadingStock && (
          <div className="state-msg">Loading {selectedTicker}...</div>
        )}
        {stockError && <div className="state-msg error">{stockError}</div>}

        {stock && !isLoadingStock && (
          <div className="dashboard-main">
            <StockChart
              chartData={chartData}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              tickerSymbol={selectedTicker}
              timeRangeOptions={CHART_TIME_RANGES}
            />
            <PortfolioPanel
              marketCap={stock.marketCap}
              volume={stock.volume}
              week52High={stock.week_52_high}
              week52Low={stock.week_52_low}
              peRatio={stock.pe_ratio}
              dividendYield={stock.dividend_yield}
            />
          </div>
        )}
      </main>
    </div>
  );
}
