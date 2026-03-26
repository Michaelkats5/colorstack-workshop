import { useState } from "react";

import { NAVIGATION_ITEMS, WORKSHOP_USER } from "./constants/appConstants";
import { useStockData } from "./hooks/useStockData";
import LeftPanel from "./components/LeftPanel";
import PortfolioPanel from "./components/PortfolioPanel";
import Sidebar from "./components/Sidebar";
import StockChart from "./components/StockChart";
import TopBar from "./components/TopBar";
import "./globalStyles.css";

export default function App() {
  const [currentUser] = useState(WORKSHOP_USER);
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
        articles={newsArticles}
        quoteSnapshots={quoteSnapshots}
        onRemoveWatchlistTicker={handleRemoveWatchlistTicker}
      />

      <main className="main main-content">
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
          <div className="dashboard-main right-panel body-layout">
            <StockChart
              chartData={chartData}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              tickerSymbol={selectedTicker}
              timeRangeOptions={chartTimeRanges}
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
