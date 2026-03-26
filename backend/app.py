"""
Flask API for the workshop stock dashboard.
Stock data: yfinance (Yahoo) only.
"""

import os
from datetime import datetime, timezone

import yfinance as yf
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-workshop")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
HISTORY_START_DATE = os.getenv("HISTORY_START_DATE", "2016-01-01")

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


# ── helpers ──────────────────────────────────────────────────────────────────


def safe_float(value, default=0.0):
    """Return float(value), or default if value is None / unconvertible."""
    try:
        return float(value) if value is not None else default
    except (TypeError, ValueError):
        return default


def get_ticker(symbol):
    return yf.Ticker(symbol.upper())


def error(message, ticker, status=503):
    return jsonify({"error": message, "ticker": ticker}), status


def _normalize_epoch_seconds(ts):
    """Yahoo sometimes sends Unix seconds, sometimes ms."""
    if ts is None:
        return None
    try:
        t = float(ts)
    except (TypeError, ValueError):
        return None
    if t > 1e12:
        t /= 1000.0
    return t


# ── data builders ─────────────────────────────────────────────────────────────


def build_quote(symbol, stock=None):
    """Return a dict of live quote fields for the given symbol."""
    if stock is None:
        stock = get_ticker(symbol)

    info = stock.info or {}
    fast = getattr(stock, "fast_info", {}) or {}

    # price — try info first, then fast_info (yfinance often warms up on second field)
    price = info.get("currentPrice") or info.get("regularMarketPrice")
    if not price:
        price = fast.get("last_price")
    if not price:
        raise ValueError("No price available for this ticker. Check the symbol and try again.")

    # dividend yield — Yahoo gives a decimal (0.0041), we store it as a percent (0.41)
    raw_div = info.get("dividendYield")
    dividend_yield = (
        round(raw_div * 100, 2)
        if raw_div and raw_div <= 0.2
        else (round(raw_div, 2) if raw_div else None)
    )

    # quote timestamp — Unix int → ISO UTC string
    ts = info.get("regularMarketTime")
    quote_time = None
    if isinstance(ts, (int, float)):
        tsec = _normalize_epoch_seconds(ts)
        if tsec is not None:
            try:
                quote_time = datetime.fromtimestamp(tsec, tz=timezone.utc).isoformat()
            except (OSError, OverflowError, ValueError):
                quote_time = None

    return {
        "symbol": symbol.upper(),
        "name": info.get("longName") or info.get("shortName") or symbol,
        "price": round(safe_float(price), 2),
        "change": round(safe_float(info.get("regularMarketChangePercent")), 2),
        "volume": info.get("volume") or info.get("regularMarketVolume"),
        "marketCap": info.get("marketCap"),
        "high": round(safe_float(info.get("dayHigh")), 2) if info.get("dayHigh") else None,
        "low": round(safe_float(info.get("dayLow")), 2) if info.get("dayLow") else None,
        "week_52_high": round(safe_float(info.get("fiftyTwoWeekHigh")), 2)
        if info.get("fiftyTwoWeekHigh")
        else None,
        "week_52_low": round(safe_float(info.get("fiftyTwoWeekLow")), 2)
        if info.get("fiftyTwoWeekLow")
        else None,
        "pe_ratio": round(safe_float(info.get("trailingPE")), 2)
        if info.get("trailingPE")
        else None,
        "dividend_yield": dividend_yield,
        "market_state": info.get("marketState"),
        "exchange_timezone": info.get("exchangeTimezoneName"),
        "quote_time_iso": quote_time,
    }


def build_history(symbol, stock=None):
    """Return a list of {date, close, volume} dicts from HISTORY_START_DATE to today."""
    if stock is None:
        stock = get_ticker(symbol)

    hist = stock.history(start=HISTORY_START_DATE)
    if hist is None or hist.empty:
        raise ValueError("No historical data returned for this ticker.")

    today = datetime.now(timezone.utc).date().isoformat()
    rows = []
    for date_idx, row in hist.iterrows():
        date_str = date_idx.strftime("%Y-%m-%d")
        if date_str <= today:
            rows.append(
                {
                    "date": date_str,
                    "close": round(safe_float(row.get("Close")), 2),
                    "volume": int(safe_float(row.get("Volume"), 0)),
                }
            )

    rows.sort(key=lambda r: r["date"])
    return rows


def build_news(symbol, stock=None):
    """Return up to 12 news articles as {title, source, date, link} dicts."""
    if stock is None:
        stock = get_ticker(symbol)

    articles = []
    for item in (getattr(stock, "news", None) or [])[:12]:
        title = (item.get("title") or "").strip()
        if not title:
            continue
        ts = item.get("providerPublishTime")
        date_str = ""
        if ts is not None:
            tsec = _normalize_epoch_seconds(ts)
            if tsec is not None:
                try:
                    date_str = datetime.fromtimestamp(tsec, tz=timezone.utc).strftime(
                        "%b %d, %Y · %H:%M UTC"
                    )
                except (OSError, ValueError, OverflowError):
                    pass
        articles.append(
            {
                "title": title,
                "source": item.get("publisher") or "Yahoo Finance",
                "date": date_str,
                "link": item.get("link") or "",
            }
        )
    return articles


# ── routes ────────────────────────────────────────────────────────────────────


@app.route("/")
def root():
    return jsonify({"status": "ok", "message": "ColorStack Finance API is running"})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/stock/<ticker>")
def stock_quote_and_history(ticker):
    """Main endpoint — live quote + full history in one response."""
    symbol = ticker.upper()
    try:
        stock = get_ticker(symbol)
        payload = build_quote(symbol, stock)
        payload["history"] = build_history(symbol, stock)
        payload["history_start"] = HISTORY_START_DATE
        payload["data_source"] = "yfinance"
        return jsonify(payload)
    except ValueError as exc:
        return error(str(exc), symbol)
    except Exception as exc:
        return error(str(exc), symbol)


@app.route("/api/stock/<ticker>/history")
def stock_history(ticker):
    """History-only endpoint — useful if you want chart data without re-fetching the quote."""
    symbol = ticker.upper()
    try:
        history = build_history(symbol)
        return jsonify(
            {
                "ticker": symbol,
                "history": history,
                "history_start": HISTORY_START_DATE,
                "data_source": "yfinance",
            }
        )
    except Exception as exc:
        return error(str(exc), symbol)


@app.route("/api/stock/<ticker>/news")
def stock_news(ticker):
    """News endpoint — up to 12 recent Yahoo Finance headlines."""
    symbol = ticker.upper()
    try:
        articles = build_news(symbol)
        return jsonify({"ticker": symbol, "articles": articles, "data_source": "yfinance"})
    except Exception as exc:
        return error(str(exc), symbol)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
