import { useState } from "react";
import { Plus } from "lucide-react";
import Toggle from "../components/Toggle";
import { ADMIN_ROLES, adminProfiles as seed } from "../data/mockData";

function RoleBadge({ role }) {
  const styles = {
    [ADMIN_ROLES.SUPER_ADMIN]: "bg-navy-900 text-white",
    [ADMIN_ROLES.ARBITER]: "bg-mint-300 text-navy-900",
    [ADMIN_ROLES.MODERATOR]: "bg-mint-300 text-navy-900",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
        styles[role] || "bg-slate-100 text-ink-700"
      }`}
    >
      {role}
    </span>
  );
}

export default function AdminProfiles() {
  const [admins, setAdmins] = useState(seed);

  function toggleActive(id) {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  }

  function deactivate(id) {
    if (!confirm("Deactivate this admin account?")) return;
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: false } : a))
    );
  }

  function addAdmin() {
    const name = prompt("Admin name?");
    if (!name) return;
    const email = prompt("Email?") || "new.admin@nexus.com";
    setAdmins((prev) => [
      ...prev,
      {
        id: `ADM-${(prev.length + 1).toString().padStart(3, "0")}`,
        name,
        email,
        role: ADMIN_ROLES.MODERATOR,
        active: true,
        created: new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900">
            Admin Profiles
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Manage dispute resolution personnel and permissions.
          </p>
        </div>
        <button
          onClick={addAdmin}
          className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
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
                  className="border-b border-slate-50 last:border-0 hover:bg-lavender-50/50"
                >
                  <Td className="font-semibold text-ink-900">{a.name}</Td>
                  <Td>{a.email}</Td>
                  <Td>
                    <RoleBadge role={a.role} />
                  </Td>
                  <Td>
                    <Toggle
                      checked={a.active}
                      onChange={() => toggleActive(a.id)}
                      ariaLabel={`Toggle active status for ${a.name}`}
                    />
                  </Td>
                  <Td>{a.created}</Td>
                  <Td className="text-right pr-6">
                    <div className="inline-flex items-center gap-4">
                      <button className="text-[12px] font-semibold text-ink-700 hover:text-navy-900">
                        Edit
                      </button>
                      <button
                        onClick={() => deactivate(a.id)}
                        className="text-[12px] font-semibold text-rose-500 hover:text-rose-600"
                      >
                        Deactivate
                      </button>
                    </div>
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
    <th
      className={`px-6 py-3 text-[12px] font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-6 py-3.5 text-ink-700 ${className}`}>{children}</td>;
}
