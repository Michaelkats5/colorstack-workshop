# Colorstack Fintech Workshop

Full-stack stock dashboard: **Flask** backend + **React (Vite)** frontend. Stock data comes from **yfinance** (Yahoo Finance) — no RapidAPI key required for the workshop.

## Workshop Version

- **Google OAuth is disabled** — the UI uses a fixed “Workshop User” and does not call `/auth/*` or send cookies.
- **No `.env` file is required** to run the backend; optional `FRONTEND_URL` helps CORS if your dev port is not the default.
- Data is fetched with **yfinance** inside `backend/app.py` (no external API keys).

### Setup (minimal)

**Backend**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Runs at `http://localhost:5000`. Try `http://127.0.0.1:5000/api/stock/AAPL` for a live quote.

**Frontend**

```bash
cd frontend
npm install
npm start
```

Open the URL Vite prints (often `http://localhost:5173`). Optional: set `VITE_API_BASE_URL` in `frontend/.env` if the API is not on port 5000.

## Full Version (re-enable Google OAuth)

1. In `backend/app.py`, follow the commented **GOOGLE OAUTH** block: uncomment routes and add `requests` to `requirements.txt`.
2. Copy `backend/.env.example` to `backend/.env` and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `FLASK_SECRET_KEY`.
3. Set `supports_credentials=True` in CORS and use `credentials: "include"` on auth-related `fetch` calls in React.
4. In `frontend/src/App.jsx` and `Sidebar.jsx`, uncomment the OAuth / login / logout sections marked with **GOOGLE OAUTH**.

## Project layout

```text
backend/   — Flask API (yfinance)
frontend/  — React + Vite UI
```

## How frontend and backend communicate

- React calls `GET /api/stock/<ticker>` for quote fields and `GET /api/stock/<ticker>/history` for chart data (merged in the UI).
- CORS allows localhost dev origins; workshop mode does **not** use sessions or cookies.
