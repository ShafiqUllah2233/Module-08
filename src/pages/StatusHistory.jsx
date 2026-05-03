import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { getDisputeById } from "../data/mockData";

export default function StatusHistory() {
  const { id } = useParams();
  const dispute = getDisputeById(id);

  if (!dispute) {
    return (
      <div className="text-center py-20 text-ink-500">
        Dispute {id} not found.
      </div>
    );
  }

  const events = dispute.timeline;

  return (
    <div className="max-w-[860px] mx-auto">
      <Link
        to={`/disputes/${dispute.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dispute D-1024
      </Link>

      <h1 className="mt-2 text-[22px] font-extrabold text-ink-900">
        Status History
      </h1>
      <p className="text-[13px] text-ink-500 mt-1 mb-10">
        Complete audit trail of status changes for this dispute.
      </p>

      {/* Timeline */}
      <div className="relative mx-auto max-w-[640px]">
        {/* Center vertical line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200" />

        <ul className="space-y-10">
          {events.map((e, i) => {
            const isRight = i % 2 === 0;
            return (
              <li key={i} className="relative">
                {/* Center node */}
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 w-9 h-9 rounded-full bg-navy-900 text-white flex items-center justify-center shadow-md">
                  <Clock className="w-4 h-4" />
                </div>

                <div
                  className={`grid grid-cols-2 ${isRight ? "" : ""} gap-10`}
                >
                  {isRight ? (
                    <>
                      <div /> {/* spacer */}
                      <Card e={e} side="right" />
                    </>
                  ) : (
                    <>
                      <Card e={e} side="left" />
                      <div /> {/* spacer */}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Card({ e, side }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card px-5 py-4 ${
        side === "left" ? "text-left" : "text-left"
      }`}
    >
      <div className="text-[11px] text-ink-500">{e.ts}</div>
      <div className="mt-1 text-[13px] text-ink-900">
        Status changed from{" "}
        <span className="font-bold">{e.from}</span> to{" "}
        <span className="font-bold">{e.to}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-ink-500">
        Action performed by{" "}
        <span className="text-ink-900 font-semibold">{e.actor}</span>
      </div>
    </div>
  );
}
