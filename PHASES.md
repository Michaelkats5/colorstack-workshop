# Request Lifecycle — Phase by Phase

## P1 — User Input
User types a ticker and hits enter.
Files: LeftPanel.jsx, TopBar.jsx, Sidebar.jsx

## P2 — State + Trigger
State updates, useEffect fires, fetch triggered.
Files: useStockData.js, App.jsx

## P3 — API Call
fetch() sends HTTP request to Flask.
Files: stockClient.js

## P4 — Backend Processing
Flask receives request, yfinance gets Yahoo data,
helpers clean it, jsonify sends JSON back.
Files: backend/app.py

## P5 — Display
Components receive props and render on screen.
Files: StockChart.jsx, PortfolioPanel.jsx,
       StockStats.jsx, NewsSection.jsx, Watchlist.jsx
