import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Field } from "../components/Field";
import { Panel } from "../components/Panel";
import { api } from "../lib/api";
import { useT } from "../lib/i18n";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verificationStarted, setVerificationStarted] = useState(false);

  const login = useMutation({
    mutationFn: () =>
      api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate("/lobby");
    },
    onError: (err) => setError(err.message)
  });

  const startVerification = useMutation({
    mutationFn: () =>
      api("/auth/register/start", {
        method: "POST",
        body: JSON.stringify({ email })
      }),
    onSuccess: () => setVerificationStarted(true),
    onError: (err) => setError(err.message)
  });

  const register = useMutation({
    mutationFn: () =>
      api("/auth/register/complete", {
        method: "POST",
        body: JSON.stringify({ email, username, password, code })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate("/lobby");
    },
    onError: (err) => setError(err.message)
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (mode === "login") login.mutate();
    else register.mutate();
  }

  return (
    <div className="arcade-bg grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-4xl font-black text-white">GalaxyPong</div>
          <div className="mt-2 text-sm font-semibold uppercase text-neon">{mode === "login" ? t("login") : t("register")}</div>
        </div>
        <Panel>
          <form className="space-y-4" onSubmit={submit}>
            {mode === "register" && <Field label={t("email")} type="email" value={email} onChange={setEmail} required />}
            <Field label={t("username")} value={username} onChange={setUsername} required />
            <Field label={t("password")} type="password" value={password} onChange={setPassword} required />
            {mode === "register" && (
              <>
                <button
                  type="button"
                  className="h-11 w-full rounded-md border border-neon/40 bg-neon/10 font-bold text-neon hover:bg-neon/20"
                  onClick={() => startVerification.mutate()}
                  disabled={!email || startVerification.isPending}
                >
                  {verificationStarted ? "Code sent" : t("startVerification")}
                </button>
                <Field label={t("code")} value={code} onChange={setCode} required />
              </>
            )}
            {error && <p className="rounded-md border border-flare/40 bg-flare/10 p-3 text-sm text-flare">{error}</p>}
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-flare font-black text-white shadow-flare hover:brightness-110"
              disabled={login.isPending || register.isPending}
            >
              {mode === "login" ? t("login") : t("completeRegistration")}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-white/60">
            {mode === "login" ? (
              <Link className="text-neon" to="/register">
                {t("register")}
              </Link>
            ) : (
              <Link className="text-neon" to="/login">
                {t("login")}
              </Link>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
