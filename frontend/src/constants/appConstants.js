// ============================================================
// PHASE 2 ? State + Trigger
// File: frontend/src/constants/appConstants.js
// ============================================================
// What this file does in plain English:
// Stores shared constants used by state and UI layers.
// ============================================================

export const WORKSHOP_USER = {
  name: "Workshop User",
  email: "workshop@colorstack.org",
  picture: "https://ui-avatars.com/api/?name=Workshop+User&background=2563eb&color=fff",
};

export const NAVIGATION_ITEMS = [
  { icon: "T", label: "Terminal" },
  { icon: "A", label: "Analytics" },
  { icon: "S", label: "Strategy" },
  { icon: "R", label: "Archive" },
  { icon: "H", label: "Support" },
];

export const CHART_TIME_RANGES = ["1W", "1M", "3M", "6M", "1Y", "5Y", "10Y"];
export const STOCK_POLL_INTERVAL_MS = 45_000;
export const DEFAULT_WATCHLIST_TICKERS = ["TSLA", "AAPL", "MSFT", "NVDA"];
