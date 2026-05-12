import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Toggle from "../components/Toggle";

const LANGUAGE_OPTIONS = ["English (US)", "English (UK)"];

export default function Settings() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    inAppAlerts: true,
    mediationMessages: true,
    language: "English (US)",
    darkTheme: false,
  });
  const [saved, setSaved] = useState(false);

  function update(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function save(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <form onSubmit={save} className="max-w-[760px] mx-auto">
      <h1 className="text-[22px] font-extrabold text-primary font-headline">
        Settings
      </h1>
      <p className="text-[13px] text-slate-500 mt-1 mb-6">
        Configure your notifications and display preferences.
      </p>

      <Card>
        <CardHeader
          title="Notifications"
          subtitle="How you prefer to hear about disputes while testing the UX."
        />
        <div className="mt-4 space-y-4">
          <Row title="Email notifications" subtitle="Mock toggle for demo.">
            <Toggle
              checked={prefs.emailNotifications}
              onChange={(v) => update("emailNotifications", v)}
              ariaLabel="Email notifications"
            />
          </Row>
          <Row title="In-app alerts" subtitle="Bubble alerts inside this SPA.">
            <Toggle checked={prefs.inAppAlerts} onChange={(v) => update("inAppAlerts", v)} ariaLabel="In-app" />
          </Row>
          <Row title="Mediation messages" subtitle="Immediate toast when counterpart posts?">
            <Toggle
              checked={prefs.mediationMessages}
              onChange={(v) => update("mediationMessages", v)}
              ariaLabel="Mediation"
            />
          </Row>
        </div>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Appearance & language" />
        <div className="mt-4">
          <label className="text-[12px] font-semibold text-ink-900">Language</label>
          <div className="relative mt-1.5 max-w-[260px]">
            <select
              value={prefs.language}
              onChange={(e) => update("language", e.target.value)}
              className="appearance-none w-full pr-9 pl-3 py-2.5 rounded-lg border border-outline-variant/40 bg-white text-[13px] outline-none cursor-pointer focus:border-tertiary-fixed-dim"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-slate-100">
          <Row title="Dark theme" subtitle="Nexus palette ready; toggle is client-only placeholder.">
            <Toggle checked={prefs.darkTheme} onChange={(v) => update("darkTheme", v)} ariaLabel="Dark" />
          </Row>
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-emerald-600 font-semibold">Stored locally</span>}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-primary hover:opacity-95 text-on-primary text-[13px] font-semibold"
        >
          Save preferences
        </button>
      </div>
    </form>
  );
}

function Card({ children, className = "" }) {
  return <section className={`bg-white rounded-xl shadow-card p-5 ${className}`}>{children}</section>;
}

function CardHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-[15px] font-bold text-primary font-headline">{title}</h2>
      {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Row({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13px] font-semibold text-ink-900">{title}</div>
        {subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}
