"""
============================================================
PHASE 4 - Backend Processing
File: backend/app.py
============================================================
What this file does in plain English:
Flask receives stock requests from React, asks yfinance for data,
cleans the results, and sends JSON responses back to the frontend.
============================================================
"""

import os
import math
from datetime import datetime, timezone

import yfinance as yf
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

# Load local env values from backend/.env.
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-workshop")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
HISTORY_START_DATE = os.getenv("HISTORY_START_DATE", "2016-01-01")

# Allow requests from common Vite dev origins.
CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        FRONTEND_URL,
    ],
)


# This helper converts many numeric-like values to float safely.
def safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        numeric_value = float(value)
        if not math.isfinite(numeric_value):
            return default
        return numeric_value
    except (TypeError, ValueError):
        return default


# This helper creates a yfinance ticker object for one symbol.
def get_ticker(symbol):
    return yf.Ticker(symbol.upper())


# This helper returns a consistent JSON error body.
def error(message, ticker, status=503):
    return jsonify({"error": message, "ticker": ticker}), status


# This helper ensures uncaught exceptions are still sent as JSON.
@app.errorhandler(Exception)
def handle_unexpected_exception(exception_object):
    return jsonify({"error": str(exception_object), "ticker": None}), 500


# This helper normalizes Unix timestamps that might be in seconds or milliseconds.
def normalize_epoch_seconds(timestamp_value):
    if timestamp_value is None:
        return None
    try:
        epoch_seconds = float(timestamp_value)
    except (TypeError, ValueError):
        return None
    if epoch_seconds > 1e12:
        epoch_seconds /= 1000.0
    return epoch_seconds


# This helper builds the quote object React uses in TopBar and stats cards.
def build_quote(symbol, stock=None):
    if stock is None:
        stock = get_ticker(symbol)

    info = stock.info or {}
    fast_info = getattr(stock, "fast_info", {}) or {}

    price_value = info.get("currentPrice") or info.get("regularMarketPrice")
    if not price_value:
        price_value = fast_info.get("last_price")
    if not price_value:
        raise ValueError("No price available for this ticker. Check the symbol and try again.")

    raw_dividend = info.get("dividendYield")
    dividend_yield = None
    if raw_dividend:
        if raw_dividend <= 0.2:
            dividend_yield = round(raw_dividend * 100, 2)
        else:
            dividend_yield = round(raw_dividend, 2)

    quote_time_iso = None
    quote_timestamp = normalize_epoch_seconds(info.get("regularMarketTime"))
    if quote_timestamp is not None:
        try:
            quote_time_iso = datetime.fromtimestamp(quote_timestamp, tz=timezone.utc).isoformat()
        except (OSError, OverflowError, ValueError):
            quote_time_iso = None

    return {
        "symbol": symbol.upper(),
        "name": info.get("longName") or info.get("shortName") or symbol,
        "price": round(safe_float(price_value), 2),
        "change": round(safe_float(info.get("regularMarketChangePercent")), 2),
        "volume": info.get("volume") or info.get("regularMarketVolume"),
        "marketCap": info.get("marketCap"),
        "high": round(safe_float(info.get("dayHigh")), 2) if info.get("dayHigh") else None,
        "low": round(safe_float(info.get("dayLow")), 2) if info.get("dayLow") else None,
        "week_52_high": round(safe_float(info.get("fiftyTwoWeekHigh")), 2) if info.get("fiftyTwoWeekHigh") else None,
        "week_52_low": round(safe_float(info.get("fiftyTwoWeekLow")), 2) if info.get("fiftyTwoWeekLow") else None,
        "pe_ratio": round(safe_float(info.get("trailingPE")), 2) if info.get("trailingPE") else None,
        "dividend_yield": dividend_yield,
        "market_state": info.get("marketState"),
        "exchange_timezone": info.get("exchangeTimezoneName"),
        "quote_time_iso": quote_time_iso,
    }


# This helper builds chart history rows used by StockChart.
def build_history(symbol, stock=None):
    if stock is None:
        stock = get_ticker(symbol)

    history_table = stock.history(start=HISTORY_START_DATE)
    if history_table is None or history_table.empty:
        raise ValueError("No historical data returned for this ticker.")

    today_utc = datetime.now(timezone.utc).date().isoformat()
    rows = []
    for date_index, history_row in history_table.iterrows():
        date_string = date_index.strftime("%Y-%m-%d")
        if date_string <= today_utc:
            rows.append(
                {
                    "date": date_string,
                    "close": round(safe_float(history_row.get("Close")), 2),
                    "volume": int(safe_float(history_row.get("Volume"), 0)),
                }
            )

    rows.sort(key=lambda row: row["date"])
    return rows


# This helper builds up to 12 news rows for NewsSection.
def build_news(symbol, stock=None):
    if stock is None:
        stock = get_ticker(symbol)

    articles = []
    raw_news_items = getattr(stock, "news", None) or []
    for news_item in raw_news_items[:12]:
        title_text = (news_item.get("title") or "").strip()
        if not title_text:
            continue

        date_text = ""
        publish_timestamp = normalize_epoch_seconds(news_item.get("providerPublishTime"))
        if publish_timestamp is not None:
            try:
                date_text = datetime.fromtimestamp(publish_timestamp, tz=timezone.utc).strftime("%b %d, %Y - %H:%M UTC")
            except (OSError, ValueError, OverflowError):
                date_text = ""

        articles.append(
            {
                "title": title_text,
                "source": news_item.get("publisher") or "Yahoo Finance",
                "date": date_text,
                "link": news_item.get("link") or "",
            }
        )
    return articles


# This route confirms the API process is running.
@app.route("/")
def root():
    return jsonify({"status": "ok", "message": "ColorStack Finance API is running"})


# This route is a simple health check used by local diagnostics.
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


# This route returns one quote object and full history in one response.
@app.route("/api/stock/<ticker>")
def stock_quote_and_history(ticker):
    symbol = ticker.upper()
    print(f"[P4] Request received for: {symbol}")

    try:
        stock = get_ticker(symbol)
        payload = build_quote(symbol, stock)
        print(f"[P4] yfinance returned price: {payload['price']}")

        payload["history"] = build_history(symbol, stock)
        payload["history_start"] = HISTORY_START_DATE
        payload["data_source"] = "yfinance"

        print("[P4] Sending response to React")
        return jsonify(payload)
    except ValueError as error_object:
        return error(str(error_object), symbol)
    except Exception as error_object:
        return error(str(error_object), symbol)


# This route returns only history rows for chart-only refresh scenarios.
@app.route("/api/stock/<ticker>/history")
def stock_history(ticker):
    symbol = ticker.upper()
    print(f"[P4] History request received for: {symbol}")

    try:
        history_rows = build_history(symbol)
        print(f"[P4] Sending {len(history_rows)} history rows")
        return jsonify(
            {
                "ticker": symbol,
                "history": history_rows,
                "history_start": HISTORY_START_DATE,
                "data_source": "yfinance",
            }
        )
    except Exception as error_object:
        return error(str(error_object), symbol)


# This route returns latest news rows for the selected ticker.
@app.route("/api/stock/<ticker>/news")
def stock_news(ticker):
    symbol = ticker.upper()
    print(f"[P4] News request received for: {symbol}")

    try:
        articles = build_news(symbol)
        print(f"[P4] Sending {len(articles)} news rows")
        return jsonify({"ticker": symbol, "articles": articles, "data_source": "yfinance"})
    except Exception as error_object:
        return error(str(error_object), symbol)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
