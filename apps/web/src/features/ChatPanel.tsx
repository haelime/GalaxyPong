import { FormEvent, useEffect, useState } from "react";
import { Panel } from "../components/Panel";
import { getSocket } from "../lib/realtime";
import { useT } from "../lib/i18n";

type Message = {
  id: string;
  username: string;
  message: string;
  whisper: boolean;
  createdAt: string;
};

export function ChatPanel() {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socket = getSocket();
    socket.on("chat:message", (payload) => setMessages((current) => [...current.slice(-60), payload]));
    return () => {
      socket.off("chat:message");
    };
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    getSocket().emit("chat:send", parseMessage(message));
    setMessage("");
  }

  return (
    <Panel>
      <h2 className="mb-3 text-lg font-black">{t("chat")}</h2>
      <div className="h-64 overflow-y-auto rounded-md border border-white/10 bg-black/30 p-3">
        {messages.map((item) => (
          <div key={item.id} className={item.whisper ? "text-amber" : "text-white/85"}>
            <span className="font-bold">{item.username}</span>: {item.message}
          </div>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={submit}>
        <input
          className="h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-neon"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="/w username message"
        />
        <button className="h-11 rounded-md bg-neon px-4 font-black text-black">{t("send")}</button>
      </form>
    </Panel>
  );
}

function parseMessage(message: string) {
  if (message.startsWith("/w ")) {
    const [, toUsername, ...parts] = message.split(" ");
    return { toUsername, message: parts.join(" ") };
  }
  return { message };
}
