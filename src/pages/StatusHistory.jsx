import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { apiFetch } from "../api/client";

export default function StatusHistory() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const rows = await apiFetch(`/api/disputes/${id}/history`);
        setEvents(rows || []);
        try {
          const d = await apiFetch(`/api/disputes/${id}`);
          setTitle(d.display_id || `#${id}`);
        } catch {
          setTitle(`#${id}`);
        }
      } catch (e) {
        setError(e.message || "Failed to load history.");
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-[860px] mx-auto text-center py-20 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto">
      <Link
        to={`/disputes/${id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to dispute
      </Link>

      <h1 className="mt-2 text-[22px] font-extrabold text-primary font-headline">
        Status history · {title}
      </h1>
      <p className="text-[13px] text-slate-500 mt-1 mb-10">
        Complete audit trail of status changes for this dispute.
      </p>

      <div className="relative mx-auto max-w-[640px]">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200" />
        <ul className="space-y-10">
          {events.map((e, i) => {
            const isRight = i % 2 === 0;
            return (
              <li key={e.id} className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-2 gap-10">
                  {isRight ? (
                    <>
                      <div />
                      <HistoryCard e={e} />
                    </>
                  ) : (
                    <>
                      <HistoryCard e={e} />
                      <div />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {events.length === 0 && (
          <p className="text-center text-slate-500 py-12">No history entries yet.</p>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ e }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 px-5 py-4">
      <div className="text-[11px] text-slate-500">{e.changed_at?.replace("T", " ").slice(0, 16)}</div>
      <div className="mt-1 text-[13px] text-on-surface">
        <span className="font-bold">{e.old_status_label}</span>
        <span className="text-slate-500"> → </span>
        <span className="font-bold">{e.new_status_label}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        By <span className="text-ink-900 font-semibold">{e.changed_by?.name || "—"}</span>
      </div>
    </div>
  );
}
