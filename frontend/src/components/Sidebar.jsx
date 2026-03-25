/**
 * Fixed icon rail: primary app sections (workshop uses local state only).
 */
export default function Sidebar({ navigationItems, activeNav, onNavChange }) {
  return (
    <aside className="icon-rail sidebar">
      <div className="rail-logo">◈</div>

      {navigationItems.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`rail-btn ${activeNav === item.label ? "active" : ""}`}
          onClick={() => onNavChange(item.label)}
          title={item.label}
        >
          <span className="rail-icon">{item.icon}</span>
          <span className="rail-label">{item.label}</span>
        </button>
      ))}

      <div className="rail-spacer" />
    </aside>
  );
}
