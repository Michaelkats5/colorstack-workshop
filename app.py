import os
import requests
from flask import Flask, redirect, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()  # reads .env file into environment

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
# Allow both local dev and deployed frontend to talk to Flask
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
CORS(
    app,
    supports_credentials=True,
    origins=[r"http://localhost:\d+", r"http://127.0.0.1:\d+", FRONTEND_URL],
)


def _frontend_redirect_target():
    # Prefer the calling frontend origin during local dev (5173/5174/etc).
    origin = request.headers.get("Origin")
    if origin and ("localhost" in origin or "127.0.0.1" in origin):
        return origin

    referrer = request.referrer
    if referrer:
        parsed = urlparse(referrer)
        if parsed.scheme and parsed.netloc:
            return f"{parsed.scheme}://{parsed.netloc}"

    return FRONTEND_URL


@app.route("/")
def index():
    # Helpful landing route for local preview checks
    return jsonify({
        "status": "ok",
        "message": "ColorStack Finance backend is running",
        "frontend_url": FRONTEND_URL,
    })

# Load Google OAuth credentials from .env — never hardcode these
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI")


# ─────────────────────────────────────────────────────────────
# WORKSHOP MODE — set to True to skip Google OAuth
# Set to False when you have real Google credentials set up
# See GOOGLE_OAUTH_SETUP.md + video for full OAuth walkthrough
WORKSHOP_MODE = True
# ─────────────────────────────────────────────────────────────


# ── WORKSHOP LOGIN ────────────────────────────────────────────

@app.route("/auth/workshop-login")
def workshop_login():
    # Fake login for the workshop — no Google credentials needed
    # Sets a demo user in the session so the dashboard loads
    if not WORKSHOP_MODE:
        return jsonify({"error": "Workshop mode is disabled"}), 403
    session["user"] = {
        "name":    "Workshop User",
        "email":   "workshop@colorstack.org",
        "picture": "https://ui-avatars.com/api/?name=Workshop+User&background=2563eb&color=fff",
    }
    return redirect(_frontend_redirect_target())


# ── GOOGLE OAUTH ──────────────────────────────────────────────
# Real OAuth — only runs when WORKSHOP_MODE = False
# Watch the setup video and follow GOOGLE_OAUTH_SETUP.md to configure

@app.route("/auth/login")
def login():
    # Build Google's login URL and redirect the user there
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
    )
    return redirect(google_auth_url)


@app.route("/auth/callback")
def callback():
    # Google sends back a one-time code — swap it for an access token
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No code returned from Google"}), 400

    # Exchange code → access token
    token_res = requests.post("https://oauth2.googleapis.com/token", data={
        "code":          code,
        "client_id":     GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "grant_type":    "authorization_code",
    })
    access_token = token_res.json().get("access_token")

    # Use token to fetch user's Google profile
    user = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    # Save user to session (like a login wristband stored in a cookie)
    session["user"] = {
        "name":    user.get("name"),
        "email":   user.get("email"),
        "picture": user.get("picture"),
    }
    return redirect(_frontend_redirect_target())


@app.route("/auth/me")
def me():
    # React calls this on startup to check if someone is logged in
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401  # 401 = not logged in
    return jsonify(user)


@app.route("/auth/logout")
def logout():
    session.clear()  # wipe the session → user is logged out
    return jsonify({"message": "Logged out"})


# ── RAPIDAPI YAHOO FINANCE ────────────────────────────────────

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "yahoo-finance15.p.rapidapi.com")
RAPIDAPI_HEADERS = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
}

if not RAPIDAPI_KEY:
    # Avoid failing local development when RapidAPI credentials aren't configured.
    print("WARNING: RAPIDAPI_KEY is not set; /api/stock will use demo data.")

@app.route("/api/stock/<ticker>")
def get_stock(ticker):
    try:
        t = ticker.upper()
        def demo_stock_response(symbol: str):
            return {
                "ticker": symbol,
                "name": f"{symbol} (Demo Data)",
                "price": 213.55,
                "change": 1.24,
                "market_cap": 3200000000000,
                "volume": 65432100,
                "week_52_high": 245.12,
                "week_52_low": 164.08,
                "pe_ratio": 31.7,
                "dividend_yield": 0.55,
                "history": [
                    {"date": "2026-02-24", "close": 199.2, "volume": 62000000},
                    {"date": "2026-02-25", "close": 200.3, "volume": 61500000},
                    {"date": "2026-02-26", "close": 202.1, "volume": 60100000},
                    {"date": "2026-02-27", "close": 201.6, "volume": 59200000},
                    {"date": "2026-02-28", "close": 203.4, "volume": 60500000},
                    {"date": "2026-03-01", "close": 204.0, "volume": 61100000},
                    {"date": "2026-03-02", "close": 205.3, "volume": 62200000},
                    {"date": "2026-03-03", "close": 206.8, "volume": 63400000},
                    {"date": "2026-03-04", "close": 205.9, "volume": 62800000},
                    {"date": "2026-03-05", "close": 207.1, "volume": 64000000},
                    {"date": "2026-03-06", "close": 208.0, "volume": 64500000},
                    {"date": "2026-03-07", "close": 207.4, "volume": 63900000},
                    {"date": "2026-03-08", "close": 208.7, "volume": 64800000},
                    {"date": "2026-03-09", "close": 209.9, "volume": 65200000},
                    {"date": "2026-03-10", "close": 210.5, "volume": 65800000},
                    {"date": "2026-03-11", "close": 211.2, "volume": 66100000},
                    {"date": "2026-03-12", "close": 210.8, "volume": 65500000},
                    {"date": "2026-03-13", "close": 212.0, "volume": 66400000},
                    {"date": "2026-03-14", "close": 212.7, "volume": 66800000},
                    {"date": "2026-03-15", "close": 213.55, "volume": 65432100},
                ],
            }

        if not RAPIDAPI_KEY:
            # Keep workshop flow working even without external API credentials.
            return jsonify(demo_stock_response(t) | {"warning": "RAPIDAPI_KEY not set; using demo data.", "provider": "demo"})

        # Fetch quote (price, change, market cap, volume, P/E etc.)
        quote_res  = requests.get(
            "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote",
            headers=RAPIDAPI_HEADERS,
            params={"ticker": t, "type": "STOCKS"},
            timeout=20,
        )
        quote_data = quote_res.json() if quote_res.content else {}
        if not isinstance(quote_data, dict) or "body" not in quote_data:
            warn = quote_data.get("message") if isinstance(quote_data, dict) else "Bad quote response"
            return jsonify(demo_stock_response(t) | {"warning": warn, "provider": "demo"})
        quote = quote_data.get("body", {}) or {}

        # Fetch 30 days of historical closing prices
        hist_res  = requests.get(
            "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/history",
            headers=RAPIDAPI_HEADERS,
            params={"symbol": t, "interval": "1d", "diffandsplits": "false"},
            timeout=20,
        )
        hist_data = hist_res.json() if hist_res.content else {}
        raw_history = hist_data.get("body", None) if isinstance(hist_data, dict) else None
        if not isinstance(raw_history, dict):
            warn = hist_data.get("message") if isinstance(hist_data, dict) else "Bad history response"
            return jsonify(demo_stock_response(t) | {"warning": warn, "provider": "demo"})
        history = [
            {
                "date":   entry.get("date", ""),
                "close":  round(float(entry.get("close", 0)), 2),
                "volume": int(entry.get("volume", 0)),
            }
            for entry in raw_history.values()
            if entry.get("close")
        ]
        history = sorted(history, key=lambda x: x["date"])[-30:]
        if not history:
            warn = hist_data.get("message") if isinstance(hist_data, dict) else "Empty history"
            return jsonify(demo_stock_response(t) | {"warning": warn, "provider": "demo"})

        # Dividend yield comes as decimal — convert to %
        raw_yield = quote.get("dividendYield")
        dividend_yield = round(float(raw_yield) * 100, 2) if raw_yield else None

        return jsonify({
            "ticker":         t,
            "name":           quote.get("longName", t),
            "price":          round(float(quote.get("regularMarketPrice", 0)), 2),
            "change":         round(float(quote.get("regularMarketChangePercent", 0)), 2),
            "market_cap":     quote.get("marketCap"),
            "volume":         quote.get("regularMarketVolume"),
            "week_52_high":   quote.get("fiftyTwoWeekHigh"),
            "week_52_low":    quote.get("fiftyTwoWeekLow"),
            "pe_ratio":       quote.get("trailingPE"),
            "dividend_yield": dividend_yield,
            "history":        history,
        })
    except Exception as e:
        # Don't break the workshop UI if the upstream API has trouble.
        # We return demo data + a warning so the app remains usable.
        return jsonify({
            **({
                "ticker": t,
                "name": f"{t} (Demo Data)",
                "price": 213.55,
                "change": 1.24,
                "market_cap": 3200000000000,
                "volume": 65432100,
                "week_52_high": 245.12,
                "week_52_low": 164.08,
                "pe_ratio": 31.7,
                "dividend_yield": 0.55,
                "history": [],
            }),
            "warning": str(e),
            "provider": "demo",
        })


if __name__ == "__main__":
    # Railway assigns a random PORT via environment variable
    # Falls back to 5000 for local development
    port = int(os.getenv("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
