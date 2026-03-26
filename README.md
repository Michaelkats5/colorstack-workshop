# ColorStack Fintech Workshop

<img width="1090" height="441" alt="FInTech" src="https://github.com/user-attachments/assets/94837dae-086f-48c9-b33e-5bbd1fa66c3d" />












Full-stack stock dashboard: **Flask** + **yfinance** on the backend, **React** + **Vite** on the frontend. Live Yahoo data only — the API returns errors when a quote or history cannot be loaded (no fake numbers).

## Project structure

```text
├── frontend/    # React + Vite
├── backend/     # Flask + yfinance
├── .gitignore
├── README.md
└── .env.example # placeholders (copy into backend/.env or frontend/.env as needed)
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API base URL defaults to `http://localhost:5000`. Optional environment variables are listed in `backend/.env.example` and the root `.env.example`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). To point at a different API host, set `VITE_API_BASE_URL` in `frontend/.env` (see root `.env.example`).

## Environment variables

See **`.env.example`** at the repository root and **`backend/.env.example`** for Flask-only placeholders. Do not commit real `.env` files or API keys.

## Google OAuth (optional full version)

Workshop mode uses a fixed demo user. To re-enable Google sign-in, follow **`backend/GOOGLE_OAUTH_SETUP.md`** and the commented OAuth sections in the codebase.

## Frontend layout

`frontend/src` is organized as `api/`, `components/`, `constants/`, `hooks/`, and `utils/`, with `App.jsx` and `main.jsx` as entry points.
