import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  LayoutGrid,
  Menu,
  Settings as SettingsIcon,
  Shield,
  User,
  X,
} from "lucide-react";
import { currentUser } from "../data/mockData";

const NAV_ITEMS = [
  { to: "/disputes", label: "My Disputes", icon: FileText },
  { to: "/admin/queue", label: "Admin Resolution Queue", icon: LayoutGrid },
  { to: "/admin/profiles", label: "Admin Profiles", icon: Shield },
  { to: "/admin/audit-log", label: "System Audit Log", icon: ClipboardList },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full bg-navy-900 text-white relative">
      <div className="h-14 px-6 flex items-center justify-between">
        {/* Left: hamburger + HOME */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="text-white/90 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            to="/disputes"
            className="text-xs tracking-[0.18em] font-semibold text-white/95 hover:text-white"
          >
            HOME
          </Link>
        </div>

        {/* Center: title */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-[13px] tracking-[0.22em] font-semibold text-white/95">
            G08 — DISPUTE RESOLUTION
          </span>
        </div>

        {/* Right: FAQ / Settings / Profile */}
        <div className="flex items-center gap-6 text-[13px] text-white/85">
          <a href="#" className="hover:text-white">FAQ</a>
          <Link to="/settings" className="hover:text-white">
            Settings
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 hover:text-white"
          >
            <div className="w-7 h-7 rounded-full bg-mint-300 text-navy-900 font-bold text-[11px] flex items-center justify-center">
              {currentUser.initials}
            </div>
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </div>

      {/* Slide-in drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute top-0 left-0 h-full w-[280px] bg-navy-900 text-white shadow-2xl">
            <div className="h-14 px-5 flex items-center justify-between border-b border-white/10">
              <span className="text-[13px] tracking-[0.18em] font-semibold">
                G08 — MENU
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? "bg-mint-300 text-navy-900 font-semibold"
                        : "text-white/85 hover:bg-white/10"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
