import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Mail, ShieldCheck } from "lucide-react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

export default function UserProfile() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    active: 0,
    resolved: 0,
  });

  const loadCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const uid = user.id;
      const [c, r] = await Promise.all([
        apiFetch(`/api/disputes?complainant_id=${uid}`),
        apiFetch(`/api/disputes?respondent_id=${uid}`),
      ]);
      const map = new Map();
      for (const d of [...c, ...r]) map.set(d.id, d);
      const all = [...map.values()];
      const active = all.filter(
        (d) => d.status !== "resolution_completed"
      ).length;
      const resolved = all.filter((d) => d.status === "resolution_completed").length;
      setCounts({ active, resolved });
    } catch {
      setCounts({ active: "—", resolved: "—" });
    }
  }, [user?.id]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const inits = useMemo(() => initials(user?.name), [user?.name]);

  if (!user) return null;

  return (
    <div className="max-w-[860px] mx-auto">
      <section className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden border border-outline-variant/15">
        <div
          className="h-28 w-full bg-gradient-to-r from-surface-container-high via-surface-container to-tertiary-fixed/40"
          aria-hidden
        />
        <div className="px-6 pb-6 -mt-12">
          <div className="w-24 h-24 rounded-full bg-primary text-on-primary text-[26px] font-extrabold flex items-center justify-center ring-4 ring-white shadow-md font-headline">
            {inits}
          </div>

          <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[22px] font-extrabold text-primary font-headline">
                  {user.name}
                </h1>
                <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold bg-pill-openBg text-pill-openFg">
                  {user.role}
                </span>
                {user.is_admin && (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold bg-mint-300 text-navy-900">
                    {user.admin_profile?.role || "Admin"}
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1 text-[12px] text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Status: {user.account_status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <h2 className="mt-8 mb-3 text-[15px] font-bold text-primary font-headline">
        Platform activity — disputes module
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityCard
          icon={<FileText className="w-5 h-5 text-primary" />}
          iconBg="bg-surface-container"
          value={counts.active}
          label="Non-resolved disputes (you as party)"
        />
        <ActivityCard
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          value={counts.resolved}
          label="Resolved disputes"
        />
        <ActivityCard
          icon={<Calendar className="w-5 h-5 text-slate-600" />}
          iconBg="bg-slate-50"
          value={user.is_admin ? "Yes" : "No"}
          label="Elevated moderator access"
        />
      </div>
    </div>
  );
}

function ActivityCard({ icon, iconBg, value, label }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card px-5 py-6 border border-outline-variant/10 text-center">
      <div
        className={`mx-auto w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="mt-3 text-[26px] font-extrabold text-primary font-headline leading-none">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-slate-500">{label}</div>
    </div>
  );
}
