import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Toggle from "../components/Toggle";
import { LANGUAGE_OPTIONS } from "../data/mockData";

export default function Settings() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    inAppAlerts: true,
    mediationMessages: true,
    language: "English (US)",
    darkTheme: false,
    privateProfile: false,
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
      <h1 className="text-[22px] font-extrabold text-ink-900">Settings</h1>
      <p className="text-[13px] text-ink-500 mt-1 mb-6">
        Manage your account preferences and notifications.
      </p>

      {/* Notifications */}
      <Card>
        <CardHeader
          title="Notifications"
          subtitle="Configure how you want to be alerted about dispute updates."
        />
        <div className="mt-4 space-y-4">
          <Row
            title="Email Notifications"
            subtitle="Receive daily summaries and critical alerts via email."
          >
            <Toggle
              checked={prefs.emailNotifications}
              onChange={(v) => update("emailNotifications", v)}
              ariaLabel="Email notifications"
            />
          </Row>
          <Row
            title="In-App Alerts"
            subtitle="Show popup notifications while you are using the app."
          >
            <Toggle
              checked={prefs.inAppAlerts}
              onChange={(v) => update("inAppAlerts", v)}
              ariaLabel="In-app alerts"
            />
          </Row>
          <Row
            title="Mediation Messages"
            subtitle="Get notified immediately when the other party sends a message."
          >
            <Toggle
              checked={prefs.mediationMessages}
              onChange={(v) => update("mediationMessages", v)}
              ariaLabel="Mediation message notifications"
            />
          </Row>
        </div>
      </Card>

      {/* Appearance & Language */}
      <Card className="mt-5">
        <CardHeader
          title="Appearance & Language"
          subtitle="Customize the interface."
        />

        <div className="mt-4">
          <label className="text-[12px] font-semibold text-ink-900">
            Language
          </label>
          <div className="relative mt-1.5 max-w-[260px]">
            <select
              value={prefs.language}
              onChange={(e) => update("language", e.target.value)}
              className="appearance-none w-full pr-9 pl-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-ink-900 outline-none focus:border-mint-400 cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <Row
            title="Dark Theme"
            subtitle="Switch the UI to dark mode."
          >
            <Toggle
              checked={prefs.darkTheme}
              onChange={(v) => update("darkTheme", v)}
              ariaLabel="Dark theme"
            />
          </Row>
        </div>
      </Card>

      {/* Privacy & Security (red border) */}
      <section className="mt-5 bg-white rounded-xl shadow-card p-5 border border-rose-300">
        <div>
          <h2 className="text-[15px] font-bold text-rose-600">
            Privacy &amp; Security
          </h2>
          <p className="text-[12px] text-ink-500 mt-0.5">
            Manage your data and account security.
          </p>
        </div>

        <div className="mt-4">
          <Row
            title="Make Profile Private"
            subtitle="Hide your profile from public searches."
          >
            <Toggle
              checked={prefs.privateProfile}
              onChange={(v) => update("privateProfile", v)}
              ariaLabel="Make profile private"
            />
          </Row>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm("Submit a request to delete your account?")) {
              alert("Deletion request submitted.");
            }
          }}
          className="mt-5 inline-flex items-center px-4 py-2 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-[12px] font-semibold"
        >
          Request Account Deletion
        </button>
      </section>

      <div className="mt-6 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-[12px] text-emerald-600 font-semibold">
            Preferences saved
          </span>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-[13px] font-semibold"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
}

function Card({ children, className = "" }) {
  return (
    <section className={`bg-white rounded-xl shadow-card p-5 ${className}`}>
      {children}
    </section>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
      {subtitle && <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Row({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink-900">{title}</div>
        {subtitle && (
          <div className="text-[11px] text-ink-500 mt-0.5">{subtitle}</div>
        )}
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}
