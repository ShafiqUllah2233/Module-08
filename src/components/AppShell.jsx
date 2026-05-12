import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  [
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200",
    isActive
      ? "bg-white text-primary shadow-sm border border-outline-variant/20"
      : "text-slate-600 hover:bg-surface-container-high hover:text-primary",
  ].join(" ");

function MobileLink({ to, children }) {
  return (
    <Link
      to={to}
      className="shrink-0 px-2 py-1 rounded-md bg-surface-container hover:bg-surface-container-high whitespace-nowrap"
    >
      {children}
    </Link>
  );
}

export default function AppShell() {
  const { user, logout, isSuperAdmin } = useAuth();
  const isAdmin = user?.is_admin;
  const canFileDispute = !isAdmin;
  const canManageAdmins = !!isAdmin;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <header className="h-16 flex justify-between items-center w-full px-6 lg:px-8 sticky top-0 z-50 backdrop-blur-md bg-primary text-on-primary border-b border-primary-container/30 shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/disputes" className="flex flex-col leading-none">
            <span className="text-lg font-black uppercase tracking-tight font-headline">
              Nexus Pro
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
              Dispute Resolution
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                {user?.name || "User"}
              </p>
              <p className="text-[9px] font-medium text-white/60 uppercase">
                {isAdmin
                  ? user?.admin_profile?.role === "super_admin"
                    ? "Super Admin"
                    : "Moderator"
                  : user?.role || ""}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-extrabold">
              {(user?.name || "?")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("")}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="text-[11px] font-bold uppercase tracking-wider text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden md:flex w-64 shrink-0 flex-col p-4 bg-gradient-to-b from-surface-container-low to-surface border-r border-outline-variant/20">
          <nav className="flex-grow space-y-1">
            <p className="px-3 mb-3 text-[10px] font-black tracking-widest uppercase text-slate-400">
              Navigation
            </p>
            <NavLink to="/disputes" className={navClass}>
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              My disputes
            </NavLink>
            {canFileDispute && (
              <NavLink to="/disputes/new" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">post_add</span>
                File dispute
              </NavLink>
            )}
            {isAdmin && (
              <>
                <NavLink to="/admin/queue" className={navClass}>
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  Resolve disputes
                </NavLink>
                <NavLink to="/admin/profiles" className={navClass}>
                  <span className="material-symbols-outlined text-[20px]">shield_person</span>
                  Admin profiles
                </NavLink>
                <NavLink to="/admin/audit-log" className={navClass}>
                  <span className="material-symbols-outlined text-[20px]">history_edu</span>
                  Audit log
                </NavLink>
              </>
            )}
            {canManageAdmins && (
              <NavLink to="/admin/register" className={navClass}>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Add admin
              </NavLink>
            )}
            <NavLink to="/profile" className={navClass}>
              <span className="material-symbols-outlined text-[20px]">person</span>
              Profile
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Settings
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <nav className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-2 border-b border-outline-variant/20 text-[10px] font-bold uppercase tracking-wide text-primary">
              <MobileLink to="/disputes">Disputes</MobileLink>
              {canFileDispute && <MobileLink to="/disputes/new">File</MobileLink>}
              {isAdmin && (
                <>
                  <MobileLink to="/admin/queue">Resolve</MobileLink>
                  <MobileLink to="/admin/profiles">Admins</MobileLink>
                  <MobileLink to="/admin/audit-log">Audit</MobileLink>
                </>
              )}
              {canManageAdmins && <MobileLink to="/admin/register">+ Admin</MobileLink>}
              <MobileLink to="/profile">Profile</MobileLink>
            </nav>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
