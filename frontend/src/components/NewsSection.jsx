// ============================================================
// PHASE 5 — Display
// File: frontend/src/components/NewsSection.jsx
// ============================================================
// What this file does in plain English:
// Shows the latest headlines returned by the backend.
// It renders links when available and plain rows otherwise.
// ============================================================

import { NEWS_PREVIEW_MAX } from "../utils/newsUtils";

// This helper picks a stable key for each news row.
function getNewsRowKey(newsItem, index) {
  return `${newsItem.title}-${index}`;
}

// NewsSection receives:
// items / articles — list of article objects from backend
// title            — heading shown above rows
// maxArticles      — number of rows to display
export default function NewsSection({ items, articles, title = "Latest News", maxArticles = NEWS_PREVIEW_MAX }) {
  const sourceArticles = Array.isArray(articles) ? articles : Array.isArray(items) ? items : [];
  const visibleArticles = sourceArticles.slice(0, maxArticles);

  return (
    <section className="news-section panel-news-card news-panel-muted" aria-label={title}>
      <h3 className="news-section-heading">{title}</h3>
      {visibleArticles.length === 0 ? (
        <p className="panel-news-empty">No headlines loaded. Pick a ticker or check that the backend is running.</p>
      ) : (
        visibleArticles.map((newsItem, index) => {
          const rowKey = getNewsRowKey(newsItem, index);
          const hasDate = newsItem.date !== null && newsItem.date !== undefined && newsItem.date !== "";

          const rowContent = (
            <>
              <span className="news-title">{newsItem.title}</span>
              <span className="news-meta">
                <span className="news-source">{newsItem.source}</span>
                {hasDate && <span className="news-date">{newsItem.date}</span>}
              </span>
            </>
          );

          if (newsItem.link) {
            return (
              <a className="news-item news-item-link" key={rowKey} href={newsItem.link} target="_blank" rel="noopener noreferrer">
                {rowContent}
              </a>
            );
          }

          return <div className="news-item" key={rowKey}>{rowContent}</div>;
        })
      )}
    </section>
  );
}
