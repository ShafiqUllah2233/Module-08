import { Calendar, FileText, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import { currentUser } from "../data/mockData";

export default function UserProfile() {
  const u = currentUser;

  return (
    <div className="max-w-[860px] mx-auto">
      {/* Header card with gradient banner */}
      <section className="bg-white rounded-xl shadow-card overflow-hidden">
        <div
          className="h-28 w-full"
          style={{
            background:
              "linear-gradient(90deg, #b9bccc 0%, #cdd1de 35%, #d6e4dc 70%, #b9e7d2 100%)",
          }}
        />
        <div className="px-6 pb-6 -mt-12">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-navy-900 text-white text-[26px] font-extrabold flex items-center justify-center ring-4 ring-white shadow-md">
            {u.initials}
          </div>

          <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-extrabold text-ink-900">
                  {u.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-pill-openBg text-pill-openFg">
                  {u.role}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-[12px] text-ink-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {u.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {u.joined}
                </div>
              </div>
            </div>
            <button className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-ink-900 hover:bg-lavender-50">
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Platform activity */}
      <h2 className="mt-8 mb-3 text-[15px] font-bold text-ink-900">
        Platform Activity
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityCard
          icon={<FileText className="w-5 h-5 text-ink-700" />}
          iconBg="bg-lavender-50"
          value={u.totalDisputes}
          label="Total Disputes"
        />
        <ActivityCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          value={u.resolvedCases}
          label="Resolved Cases"
        />
        <ActivityCard
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          value={`${u.trustScore}%`}
          label="Trust Score"
        />
      </div>
    </div>
  );
}

function ActivityCard({ icon, iconBg, value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-card px-5 py-6 text-center">
      <div
        className={`mx-auto w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="mt-3 text-[26px] font-extrabold text-ink-900 leading-none">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-ink-500">{label}</div>
    </div>
  );
}
