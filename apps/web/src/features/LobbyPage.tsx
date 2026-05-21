import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { PublicUser } from "@galaxy-pong/shared";
import { Panel } from "../components/Panel";
import { api } from "../lib/api";
import { getSocket } from "../lib/realtime";
import { useT } from "../lib/i18n";
import { ChatPanel } from "./ChatPanel";

export function LobbyPage() {
  const t = useT();
  const navigate = useNavigate();
  const [queued, setQueued] = useState(false);
  const users = useQuery({ queryKey: ["users"], queryFn: () => api<PublicUser[]>("/users") });

  useEffect(() => {
    const socket = getSocket();
    socket.on("matchmaking:queued", () => setQueued(true));
    socket.on("matchmaking:matched", ({ matchId }) => {
      setQueued(false);
      navigate(`/game/${matchId}`);
    });
    socket.on("presence:update", () => users.refetch());
    return () => {
      socket.off("matchmaking:queued");
      socket.off("matchmaking:matched");
      socket.off("presence:update");
    };
  }, [navigate, users]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <section className="min-h-[520px] rounded-md border border-white/10 bg-black/30 p-6 shadow-2xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase text-neon">Arcade command</p>
          <h1 className="mt-2 text-5xl font-black leading-tight text-white lg:text-7xl">GalaxyPong</h1>
          <p className="mt-4 max-w-2xl text-base text-white/70">
            서버 권위 온라인 대전, 친구 초대, 글로벌 채팅을 한 로비에서 시작합니다.
          </p>
          <button
            className="mt-8 h-14 rounded-md bg-flare px-8 text-lg font-black text-white shadow-flare hover:brightness-110"
            onClick={() => getSocket().emit("matchmaking:quick-join")}
          >
            {queued ? t("waiting") : t("quickMatch")}
          </button>
        </div>
      </section>

      <div className="space-y-4">
        <Panel>
          <h2 className="mb-3 text-lg font-black">{t("onlinePilots")}</h2>
          <div className="space-y-2">
            {(users.data ?? []).map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                <span className="font-semibold">{user.displayName}</span>
                <span className={user.online ? "text-neon" : "text-white/35"}>{user.online ? "online" : "offline"}</span>
              </div>
            ))}
          </div>
        </Panel>
        <ChatPanel />
      </div>
    </div>
  );
}
