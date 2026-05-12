import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

function RoleBadge({ role, label }) {
  const isSuper = role === "super_admin";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
        isSuper ? "bg-primary text-on-primary" : "bg-mint-300 text-navy-900"
      }`}
    >
      {label || role}
    </span>
  );
}

export default function AdminProfiles() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const rows = await apiFetch("/api/admins");
      setAdmins(rows || []);
      setError("");
    } catch (e) {
      setError(e.message || "Could not load admins.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user?.is_admin) {
    return <Navigate to="/disputes" replace />;
  }

  async function setRowActive(row, active) {
    if (!active && !confirm("Deactivate this admin account?")) return;
    setBusyId(row.id);
    try {
      if (!active) {
        await apiFetch(`/api/admins/${row.id}/deactivate`, { method: "POST" });
      } else {
        await apiFetch(`/api/admins/${row.id}`, {
          method: "PATCH",
          body: { is_active: true, role: row.role },
        });
      }
      await load();
    } catch (e) {
      alert(e.message || "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Administration
          </p>
          <h1 className="text-[22px] font-extrabold text-primary font-headline">
            Admin profiles
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Dispute moderation and super-admin access.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/register"
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-[13px] font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:opacity-95"
          >
            <Shield className="w-4 h-4" />
            Add admin
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-ink-700 border-b border-slate-100">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Active</Th>
                <Th>Created</Th>
                <Th className="text-right pr-6">Action</Th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-surface-container-low/70"
                >
                  <Td className="font-semibold text-ink-900">{a.name}</Td>
                  <Td>{a.email}</Td>
                  <Td>
                    <RoleBadge role={a.role} label={a.role_label} />
                  </Td>
                  <Td>{a.is_active ? "Yes" : "No"}</Td>
                  <Td>{formatDate(a.created_at)}</Td>
                  <Td className="text-right pr-6">
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() =>
                        setRowActive(a, !a.is_active)
                      }
                      className="text-[12px] font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-6 py-3 text-[12px] font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-6 py-3.5 text-ink-700 ${className}`}>{children}</td>;
}
