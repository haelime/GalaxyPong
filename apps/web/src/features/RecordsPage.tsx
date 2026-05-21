import { useQuery } from "@tanstack/react-query";
import type { PongRecord } from "@galaxy-pong/shared";
import { Panel } from "../components/Panel";
import { api } from "../lib/api";
import { useT } from "../lib/i18n";

export function RecordsPage() {
  const t = useT();
  const records = useQuery({ queryKey: ["records"], queryFn: () => api<PongRecord[]>("/records") });

  return (
    <Panel>
      <h1 className="text-2xl font-black">{t("records")}</h1>
      <div className="mt-5 overflow-hidden rounded-md border border-white/10">
        {(records.data ?? []).map((record) => (
          <div key={record.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-4 py-3 last:border-0">
            <div>
              <span className="font-black text-neon">{record.winnerUsername}</span>
              <span className="mx-2 text-white/40">def.</span>
              <span className="text-white/80">{record.loserUsername}</span>
            </div>
            <div className="font-mono text-amber">
              {record.winnerScore}:{record.loserScore}
            </div>
          </div>
        ))}
        {!records.data?.length && <div className="px-4 py-8 text-white/50">No records yet</div>}
      </div>
    </Panel>
  );
}
