import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/framingham-risk", label: "10-Year Risk" },
  { to: "/current-screening", label: "Current Screening" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-lg font-semibold text-slate-900">
          CHD Predictor
        </NavLink>

        <div className="flex gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
