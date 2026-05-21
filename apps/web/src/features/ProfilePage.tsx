import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PublicUser } from "@galaxy-pong/shared";
import { Field } from "../components/Field";
import { Panel } from "../components/Panel";
import { api } from "../lib/api";
import { useT } from "../lib/i18n";

export function ProfilePage() {
  const t = useT();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => api<PublicUser>("/users/me") });
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const update = useMutation({
    mutationFn: () =>
      api<PublicUser>("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          displayName: displayName || profile.data?.displayName,
          statusMessage
        })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    }
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate();
  }

  return (
    <Panel className="max-w-2xl">
      <h1 className="text-2xl font-black">{t("profile")}</h1>
      {profile.data && (
        <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr]">
          <div className="grid aspect-square place-items-center rounded-md border border-neon/30 bg-neon/10 text-5xl font-black text-neon">
            {profile.data.displayName.slice(0, 1).toUpperCase()}
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <Field label={t("username")} value={profile.data.username} onChange={() => undefined} />
            <Field label="Display name" value={displayName || profile.data.displayName} onChange={setDisplayName} />
            <Field label={t("statusMessage")} value={statusMessage || profile.data.statusMessage} onChange={setStatusMessage} />
            <button className="h-11 rounded-md bg-neon px-5 font-black text-black">{t("save")}</button>
          </form>
        </div>
      )}
    </Panel>
  );
}
