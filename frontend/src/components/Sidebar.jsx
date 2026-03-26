// ============================================================
// PHASE 1 ? User Input
// File: frontend/src/components/Sidebar.jsx
// ============================================================
// What this file does in plain English:
// Renders the left icon rail and lets the user switch sections.
// User clicks here update simple local navigation state.
// ============================================================

export default function Sidebar({ navigationItems, activeNav, onNavChange }) {
  return (
    <aside className="icon-rail sidebar">
      <div className="rail-logo">CS</div>

      {navigationItems.map((navItem) => (
        <button
          key={navItem.label}
          type="button"
          className={`rail-btn ${activeNav === navItem.label ? "active" : ""}`}
          onClick={() => onNavChange(navItem.label)}
          title={navItem.label}
        >
          <span className="rail-icon">{navItem.icon}</span>
          <span className="rail-label">{navItem.label}</span>
        </button>
      ))}

      <div className="rail-spacer" />
    </aside>
  );
}
