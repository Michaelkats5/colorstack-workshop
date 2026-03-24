// ── Sidebar.js ───────────────────────────────────────────────
// The thin icon rail on the far left.
// Receives:
//   NAV_ITEMS  — array of { icon, label } objects
//   activeNav  — which nav item is currently highlighted
//   setActiveNav — function to change the active nav
//   API        — Flask base URL (needed for logout)
//   setUser    — function to clear the user on logout

export default function Sidebar({ NAV_ITEMS, activeNav, setActiveNav, API, setUser }) {
  return (
    <aside className="icon-rail">
      <div className="rail-logo">◈</div>

      {/* Loop through NAV_ITEMS and render a button for each */}
      {NAV_ITEMS.map(item => (
        <button
          key={item.label}                                              // React needs a unique key when looping
          className={`rail-btn ${activeNav === item.label ? "active" : ""}`} // highlight the active one
          onClick={() => setActiveNav(item.label)}                      // clicking sets this as active
          title={item.label}                                            // tooltip on hover
        >
          <span className="rail-icon">{item.icon}</span>
          <span className="rail-label">{item.label}</span>
        </button>
      ))}

      <div className="rail-spacer" /> {/* pushes logout button to the bottom */}

      {/* Logout — calls Flask to clear the session, then removes the user from state */}
      <button
        className="rail-btn rail-logout"
        onClick={() =>
          fetch(`${API}/auth/logout`, { credentials: "include" })
            .then(() => setUser(null)) // setUser(null) triggers the login screen to show
        }
        title="Logout"
      >
        <span className="rail-icon">⇥</span>
        <span className="rail-label">Logout</span>
      </button>
    </aside>
  );
}
