import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();

  function logout() {
    // Clear both JWT tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Return to login page
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>MoneyMap</h1>

        <p className="subtitle">Personal finance dashboard</p>

        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/transactions">
            Transactions
          </NavLink>

          <NavLink to="/budgets">
            Budgets
          </NavLink>

          <NavLink to="/goals">
            Savings Goals
          </NavLink>

          <NavLink to="/import">
            Import CSV
          </NavLink>
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
        >
          Log out
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}