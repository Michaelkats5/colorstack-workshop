// ============================================================
// PHASE 3 - API Call
// File: frontend/src/api/stockClient.js
// ============================================================
// What this file does:
// Sends HTTP requests to the Flask backend.
// This is the only file that talks to Flask directly.
// ============================================================

// Flask is running here on your computer.
const API = "http://localhost:5000";

// Convert non-standard JSON tokens (NaN/Infinity) into null.
function parseServerJson(jsonText) {
  const safeJsonText = jsonText
    .replace(/\bNaN\b/g, "null")
    .replace(/\bInfinity\b/g, "null")
    .replace(/\b-Infinity\b/g, "null");
  return JSON.parse(safeJsonText);
}

// Get live stock data plus price history for the chart.
export async function fetchStockQuote(ticker) {
  const response = await fetch(`${API}/api/stock/${ticker}`);
  if (!response.ok) throw new Error("Bad response from server");

  const jsonText = await response.text();
  const data = parseServerJson(jsonText);
  if (data.error) throw new Error(data.error);

  return data;
}

// Get latest news articles for a stock.
export async function fetchStockNews(ticker) {
  const response = await fetch(`${API}/api/stock/${ticker}/news`);
  if (!response.ok) throw new Error("Bad response from server");

  const jsonText = await response.text();
  const data = parseServerJson(jsonText);
  if (data.error) throw new Error(data.error);

  return Array.isArray(data.articles) ? data.articles : [];
}
