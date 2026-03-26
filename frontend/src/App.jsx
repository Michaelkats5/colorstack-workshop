// ============================================================
// PHASE 2 — State + Trigger
// File: frontend/src/App.jsx
// ============================================================
// What this file does in plain English:
// It wires together the major UI sections.
// It reads app state from useStockData.js and passes
// each value down to the component that needs it.
// ============================================================

import { useState } from "react";

import LeftPanel from "./components/LeftPanel";
import PortfolioPanel from "./components/PortfolioPanel";
import Sidebar from "./components/Sidebar";
import StockChart from "./components/StockChart";
import TopBar from "./components/TopBar";
import { NAVIGATION_ITEMS, WORKSHOP_USER } from "./constants/appConstants";
import { useStockData } from "./hooks/useStockData";
import "./globalStyles.css";

// This helper returns null when stock object is missing so props stay predictable.
function getStockValue(stockObject, keyName) {
  if (!stockObject) return null;
  return stockObject[keyName];
}

export default function App() {
  // Demo user shown in workshop mode.
  const [currentUser] = useState(WORKSHOP_USER);

  // useStockData returns all state values + handlers the page needs.
  const {
    selectedTicker,
    setSelectedTicker,
    searchQuery,
    setSearchQuery,
    stock,
    isLoadingStock,
    stockError,
    selectedRange,
    setSelectedRange,
    watchlistTickers,
    setWatchlistTickers,
    quoteSnapshots,
    activeNavigation,
    setActiveNavigation,
    isWatchlistInputVisible,
    setIsWatchlistInputVisible,
    watchlistInputValue,
    setWatchlistInputValue,
    newsArticles,
    chartData,
    isPriceUp,
    handleSearchSubmit,
    handleRemoveWatchlistTicker,
    chartTimeRanges,
  } = useStockData();

  return (
    <div className="app app-layout">
      {/* Sidebar receives nav items and active state for icon rail interactions. */}
      <Sidebar
        navigationItems={NAVIGATION_ITEMS}
        activeNav={activeNavigation}
        onNavChange={setActiveNavigation}
      />

      {/* LeftPanel receives search/watchlist/news state and user profile data. */}
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
        articles={newsArticles}
        quoteSnapshots={quoteSnapshots}
        onRemoveWatchlistTicker={handleRemoveWatchlistTicker}
      />

      <main className="main main-content">
        {/* TopBar receives current quote + user identity so header can render context. */}
        <TopBar
          symbol={getStockValue(stock, "symbol")}
          name={getStockValue(stock, "name")}
          price={getStockValue(stock, "price")}
          change={getStockValue(stock, "change")}
          quoteTimeIso={getStockValue(stock, "quote_time_iso")}
          exchangeTimezone={getStockValue(stock, "exchange_timezone")}
          marketState={getStockValue(stock, "market_state")}
          user={currentUser}
          isPriceUp={isPriceUp}
        />

        {isLoadingStock && <div className="state-msg">Loading {selectedTicker}...</div>}
        {stockError && <div className="state-msg error">{stockError}</div>}

        {stock && !isLoadingStock && (
          <div className="dashboard-main right-panel body-layout">
            {/* StockChart shows date-range filtered history data. */}
            <StockChart
              chartData={chartData} // array of chart points from selected range
              selectedRange={selectedRange} // active range button label (1W, 1M, 3M...)
              onRangeChange={setSelectedRange} // handler for clicking a range button
              tickerSymbol={selectedTicker} // active ticker label for tooltip
              timeRangeOptions={chartTimeRanges} // all available range buttons
            />

            {/* PortfolioPanel shows stock fundamentals in a compact card. */}
            <PortfolioPanel
              marketCap={stock.marketCap} // total company value
              volume={stock.volume} // shares traded today
              week52High={stock.week_52_high} // highest price in last year
              week52Low={stock.week_52_low} // lowest price in last year
              peRatio={stock.pe_ratio} // price to earnings ratio
              dividendYield={stock.dividend_yield} // dividend percentage
            />
          </div>
        )}
      </main>
    </div>
  );
}
