"""
Flask API for the workshop stock dashboard.

Workshop version: stock data comes from yfinance only (no RapidAPI, no API keys).
Google OAuth routes are disabled below — see commented blocks to re-enable.
"""

import os
from typing import Any

import yfinance as yf
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

# Load .env if present; workshop runs fine without any .env file.
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = Flask(__name__)
# GOOGLE OAUTH — not used in workshop version
# When OAuth is re-enabled, set FLASK_SECRET_KEY in .env for session signing.
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-workshop")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

CORS(
    app,
    supports_credentials=False,
    origins=[r"http://localhost:\d+", r"http://127.0.0.1:\d+", FRONTEND_URL],
)


def _safe_float(value: Any, default: float = 0.0) -> float:
    """Coerces a value to float, returning default when missing or invalid."""
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _yf_ticker(ticker_symbol: str):
    """Returns a yfinance Ticker for the given uppercase symbol."""
    return yf.Ticker(ticker_symbol.upper())


def build_quote_dict(ticker_symbol: str) -> dict[str, Any]:
    """
    Pulls live quote fields from yfinance info / fast_info.
    Returns a dict suitable for JSON (price, name, market cap, volume, highs/lows, etc.).
    """
    stock = _yf_ticker(ticker_symbol)
    info: dict = stock.info or {}
    fast: dict = getattr(stock, "fast_info", {}) or {}

    name = (
        info.get("longName")
        or info.get("shortName")
        or fast.get("name")
        or ticker_symbol
    )
    price = (
        info.get("regularMarketPrice")
        or info.get("currentPrice")
        or fast.get("last_price")
    )
    change_pct = info.get("regularMarketChangePercent")
    if change_pct is None:
        change_pct = fast.get("regular_market_change_percent")

    market_cap = info.get("marketCap") or fast.get("market_cap")
    volume = info.get("regularMarketVolume") or info.get("volume") or fast.get("last_volume")

    day_high = info.get("dayHigh") or info.get("regularMarketDayHigh")
    day_low = info.get("dayLow") or info.get("regularMarketDayLow")
    week_52_high = info.get("fiftyTwoWeekHigh")
    week_52_low = info.get("fiftyTwoWeekLow")
    pe_ratio = info.get("trailingPE")

    raw_div = info.get("dividendYield")
    dividend_yield = None
    if raw_div is not None:
        dividend_yield = round(float(raw_div) * 100, 2) if raw_div <= 1 else round(float(raw_div), 2)

    return {
        "ticker": ticker_symbol.upper(),
        "name": name,
        "price": round(_safe_float(price), 2),
        "change": round(_safe_float(change_pct), 2),
        "market_cap": market_cap,
        "volume": volume,
        "day_high": round(_safe_float(day_high), 2) if day_high is not None else None,
        "day_low": round(_safe_float(day_low), 2) if day_low is not None else None,
        "week_52_high": round(_safe_float(week_52_high), 2) if week_52_high is not None else None,
        "week_52_low": round(_safe_float(week_52_low), 2) if week_52_low is not None else None,
        "pe_ratio": round(_safe_float(pe_ratio), 2) if pe_ratio is not None else None,
        "dividend_yield": dividend_yield,
    }


def build_history_list(ticker_symbol: str, period: str = "1y") -> list[dict[str, Any]]:
    """
    Fetches daily history from yfinance and returns a list of {date, close, volume} dicts.
    """
    stock = _yf_ticker(ticker_symbol)
    hist = stock.history(period=period)
    if hist is None or hist.empty:
        return []

    rows: list[dict[str, Any]] = []
    for date_index, row in hist.iterrows():
        date_str = date_index.strftime("%Y-%m-%d") if hasattr(date_index, "strftime") else str(date_index)[:10]
        close_val = row.get("Close")
        vol_val = row.get("Volume")
        rows.append(
            {
                "date": date_str,
                "close": round(_safe_float(close_val), 2),
                "volume": int(_safe_float(vol_val, 0)),
            }
        )
    return rows


@app.route("/")
def index():
    """Returns JSON confirming the API process is running."""
    return jsonify(
        {
            "status": "ok",
            "message": "ColorStack Finance backend is running (yfinance workshop mode)",
            "frontend_url": FRONTEND_URL,
        }
    )


@app.route("/api/healthz")
def healthz():
    """Returns JSON health status for monitoring (no secrets)."""
    return jsonify({"status": "ok", "data_source": "yfinance"})


@app.route("/api/health")
def health():
    """Minimal liveness probe; returns 200 when Flask is up."""
    return jsonify({"status": "ok"})


# --- Stock routes: register /history BEFORE /api/stock/<ticker> (more specific path) ---


@app.route("/api/stock/<ticker>/history")
def get_stock_history(ticker):
    """
    Returns historical OHLC-style points for charting (daily closes for period=1y).
    Response shape: { "ticker": "...", "history": [ { "date", "close", "volume" }, ... ] }
    """
    try:
        ticker_symbol = ticker.upper()
        history_points = build_history_list(ticker_symbol, period="1y")
        return jsonify({"ticker": ticker_symbol, "history": history_points})
    except Exception as exc:
        return jsonify({"error": str(exc), "ticker": ticker.upper(), "history": []}), 500


@app.route("/api/stock/<ticker>")
def get_stock(ticker):
    """
    Returns live quote summary for one ticker (price, name, market cap, volume, day high/low, etc.).
    Does not include full history — use GET /api/stock/<ticker>/history for charts.
    """
    try:
        ticker_symbol = ticker.upper()
        payload = build_quote_dict(ticker_symbol)
        return jsonify(payload)
    except Exception as exc:
        return jsonify({"error": str(exc), "ticker": ticker.upper()}), 500


# =============================================================================
# GOOGLE OAUTH — not used in workshop version
# Uncomment the block below to re-enable Google login
# Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FLASK_SECRET_KEY in .env
# Also add: pip install requests
# Also set supports_credentials=True in CORS and use credentials:"include" in fetch from React
# =============================================================================
#
# from urllib.parse import urlparse
# import requests
# from flask import redirect, request, session
#
# GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
# GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
#
# def frontend_redirect_target():
#     request_origin = request.headers.get("Origin")
#     if request_origin and ("localhost" in request_origin or "127.0.0.1" in request_origin):
#         return request_origin
#     request_referrer = request.referrer
#     if request_referrer:
#         parsed = urlparse(request_referrer)
#         if parsed.scheme and parsed.netloc:
#             return f"{parsed.scheme}://{parsed.netloc}"
#     return FRONTEND_URL
#
# @app.route("/auth/workshop-login")
# def workshop_login():
#     session["user"] = {...}
#     return redirect(frontend_redirect_target())
#
# @app.route("/auth/login")
# def login():
#     ...
#
# @app.route("/auth/callback")
# def callback():
#     ...
#
# @app.route("/auth/me")
# def me():
#     ...
#
# @app.route("/auth/logout")
# def logout():
#     ...


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
