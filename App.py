import os
import requests
from flask import Flask, redirect, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # reads .env file into environment

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # allow React to talk to Flask

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
    return redirect("http://localhost:3000")


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
    return redirect("http://localhost:3000")


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

RAPIDAPI_KEY  = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "yahoo-finance15.p.rapidapi.com"
RAPIDAPI_HEADERS = {
    "X-RapidAPI-Key":  RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
}

@app.route("/api/stock/<ticker>")
def get_stock(ticker):
    try:
        t = ticker.upper()

        # Fetch quote (price, change, market cap, volume, P/E etc.)
        quote_res  = requests.get(
            f"https://{RAPIDAPI_HOST}/api/v1/markets/quote",
            headers=RAPIDAPI_HEADERS,
            params={"ticker": t, "type": "STOCKS"},
        )
        quote_data = quote_res.json()
        q = quote_data.get("body", {})

        # Fetch 30 days of historical closing prices
        hist_res  = requests.get(
            f"https://{RAPIDAPI_HOST}/api/v1/markets/stock/history",
            headers=RAPIDAPI_HEADERS,
            params={"symbol": t, "interval": "1d", "diffandsplits": "false"},
        )
        hist_data = hist_res.json()
        raw_history = hist_data.get("body", {})
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

        # Dividend yield comes as decimal — convert to %
        raw_yield = q.get("dividendYield")
        dividend_yield = round(float(raw_yield) * 100, 2) if raw_yield else None

        return jsonify({
            "ticker":         t,
            "name":           q.get("longName", t),
            "price":          round(float(q.get("regularMarketPrice", 0)), 2),
            "change":         round(float(q.get("regularMarketChangePercent", 0)), 2),
            "market_cap":     q.get("marketCap"),
            "volume":         q.get("regularMarketVolume"),
            "week_52_high":   q.get("fiftyTwoWeekHigh"),
            "week_52_low":    q.get("fiftyTwoWeekLow"),
            "pe_ratio":       q.get("trailingPE"),
            "dividend_yield": dividend_yield,
            "history":        history,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # debug=True auto-restarts on save
