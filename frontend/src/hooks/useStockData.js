// ============================================================
// PHASE 2 — State + Trigger
// File: frontend/src/hooks/useStockData.js
// ============================================================
// What this file does:
// This is the brain of the app. It stores all the data,
// watches for changes, and triggers fetches when needed.
// App.jsx gets all its data from here.
// ============================================================

import { useEffect, useMemo, useState } from "react";

import { fetchStockNews, fetchStockQuote } from "../api/stockClient";
import { CHART_TIME_RANGES, DEFAULT_WATCHLIST_TICKERS, STOCK_POLL_INTERVAL_MS } from "../constants/appConstants";
import { getChartDataForRange } from "../utils/chartUtils";

// This helper fetches one ticker and turns any thrown value into a readable message.
async function requestStockData(ticker) {
  try {
    return { data: await fetchStockQuote(ticker), errorMessage: "" };
  } catch (errorObject) {
    if (errorObject instanceof Error) return { data: null, errorMessage: errorObject.message };
    return { data: null, errorMessage: "Could not load stock data. Try another ticker." };
  }
}

// This helper updates one quote snapshot entry for watchlist rows.
function setOneSnapshot(setQuoteSnapshots, symbol, price, change) {
  setQuoteSnapshots((oldSnapshots) => {
    return {
      ...oldSnapshots,
      [symbol]: { price, change },
    };
  });
}

export function useStockData() {
  // Each useState stores one piece of data the app needs.
  const [selectedTicker, setSelectedTicker] = useState("TSLA"); // current ticker the user is viewing
  const [searchQuery, setSearchQuery] = useState(""); // search box text before submit
  const [stock, setStock] = useState(null); // stock object from Flask
  const [isLoadingStock, setIsLoadingStock] = useState(false); // true while quote/history request runs
  const [stockError, setStockError] = useState(""); // user-facing error message for quote/history failures
  const [selectedRange, setSelectedRange] = useState("3M"); // active chart range button
  const [watchlistTickers, setWatchlistTickers] = useState([...DEFAULT_WATCHLIST_TICKERS]); // symbols shown in watchlist
  const [quoteSnapshots, setQuoteSnapshots] = useState({}); // small price/change cache for watchlist rows
  const [activeNavigation, setActiveNavigation] = useState("Terminal"); // active left rail section label
  const [isWatchlistInputVisible, setIsWatchlistInputVisible] = useState(false); // show/hide add-ticker form
  const [watchlistInputValue, setWatchlistInputValue] = useState(""); // text in add-ticker input
  const [newsArticles, setNewsArticles] = useState([]); // news rows for selected ticker

  // This function loads quote+history for one ticker and updates loading/error state.
  async function loadStock(ticker) {
    setIsLoadingStock(true);
    setStockError("");

    const result = await requestStockData(ticker);
    if (result.data) {
      setStock(result.data);
      setOneSnapshot(setQuoteSnapshots, result.data.symbol, result.data.price, result.data.change);
    } else {
      setStock(null);
      setStockError(result.errorMessage);
    }
    setIsLoadingStock(false);
  }

  // This function refreshes quote silently so the UI stays fresh without showing a spinner.
  async function refreshStockSilently(ticker) {
    const result = await requestStockData(ticker);
    if (!result.data) return;
    setStock(result.data);
    setOneSnapshot(setQuoteSnapshots, result.data.symbol, result.data.price, result.data.change);
  }

  // This function loads watchlist quote snapshots so each row has price/change text.
  async function loadWatchlistSnapshots() {
    const symbols = [...watchlistTickers];
    for (const tickerSymbol of symbols) {
      const result = await requestStockData(tickerSymbol);
      if (!result.data) continue;
      setOneSnapshot(setQuoteSnapshots, result.data.symbol, result.data.price, result.data.change);
    }
  }

  // This function loads news for the selected ticker.
  async function loadNews(ticker) {
    try {
      const articles = await fetchStockNews(ticker);
      setNewsArticles(articles);
    } catch {
      setNewsArticles([]);
    }
  }

  // WHEN it runs: on first mount and whenever selectedTicker changes.
  // WHY it runs: user selected a new symbol, so quote/history must be re-fetched.
  useEffect(() => {
    if (!selectedTicker) return;
    loadStock(selectedTicker);
  }, [selectedTicker]);

  // WHEN it runs: after mount and whenever selectedTicker changes.
  // WHY it runs: keep active ticker data fresh every N milliseconds.
  useEffect(() => {
    if (!selectedTicker) return undefined;
    const intervalId = window.setInterval(() => {
      refreshStockSilently(selectedTicker);
    }, STOCK_POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [selectedTicker]);

  // WHEN it runs: whenever watchlist symbols change.
  // WHY it runs: fill each watchlist row with current price/change.
  useEffect(() => {
    loadWatchlistSnapshots();
  }, [watchlistTickers]);

  // WHEN it runs: whenever selectedTicker changes.
  // WHY it runs: news list should follow the active ticker.
  useEffect(() => {
    if (!selectedTicker) {
      setNewsArticles([]);
      return;
    }
    loadNews(selectedTicker);
  }, [selectedTicker]);

  // This memo computes chart rows for the selected date range.
  const chartData = useMemo(() => {
    const stockHistory = stock && Array.isArray(stock.history) ? stock.history : [];
    return getChartDataForRange(stockHistory, selectedRange);
  }, [stock, selectedRange]);

  // This boolean decides whether price/change should be styled as green (up) or red (down).
  const isPriceUp = Boolean(stock) && Number(stock.change || 0) >= 0;

  // This handler runs when the search form is submitted.
  function handleSearchSubmit(event) {
    event.preventDefault();
    const normalizedTicker = searchQuery.trim().toUpperCase();
    if (!normalizedTicker) return;

    setSelectedTicker(normalizedTicker);
    if (!watchlistTickers.includes(normalizedTicker)) {
      setWatchlistTickers([...watchlistTickers, normalizedTicker]);
    }
    setSearchQuery("");
  }

  // This handler removes one ticker from watchlist and updates selected ticker if needed.
  function handleRemoveWatchlistTicker(tickerToRemove) {
    const nextTickers = watchlistTickers.filter((tickerSymbol) => tickerSymbol !== tickerToRemove);
    setWatchlistTickers(nextTickers);

    if (selectedTicker === tickerToRemove && nextTickers.length > 0) {
      setSelectedTicker(nextTickers[0]);
    }

    setQuoteSnapshots((oldSnapshots) => {
      const nextSnapshots = { ...oldSnapshots };
      delete nextSnapshots[tickerToRemove];
      return nextSnapshots;
    });
  }

  return {
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
    chartTimeRanges: CHART_TIME_RANGES,
  };
}
