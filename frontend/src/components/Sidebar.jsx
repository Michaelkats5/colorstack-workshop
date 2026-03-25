// Sidebar — left icon rail navigation.
// GOOGLE OAUTH — not used in workshop version
// Uncomment the logout block below to re-enable session logout (requires Flask /auth/logout + credentials)

export default function Sidebar({ NAV_ITEMS, activeNav, setActiveNav }) {
  return (
    <aside className="icon-rail">
      <div className="rail-logo">◈</div>

      {NAV_ITEMS.map((item) => (
        <button
          key={item.label}
          className={`rail-btn ${activeNav === item.label ? "active" : ""}`}
          onClick={() => setActiveNav(item.label)}
          title={item.label}
        >
          <span className="rail-icon">{item.icon}</span>
          <span className="rail-label">{item.label}</span>
        </button>
      ))}

      <div className="rail-spacer" />

      {/*
      GOOGLE OAUTH — not used in workshop version
      <button
        className="rail-btn rail-logout"
        onClick={() =>
          fetch(`${API}/auth/logout`, { credentials: "include" }).then(() => setUser(null))
        }
        title="Logout"
      >
        <span className="rail-icon">⇥</span>
        <span className="rail-label">Logout</span>
      </button>
      */}
    </aside>
  );
}
