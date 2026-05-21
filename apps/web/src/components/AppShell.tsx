import { Outlet, NavLink, Navigate } from "react-router-dom";
import { Gamepad2, LogOut, Radio, Settings, Trophy, UserRound } from "lucide-react";
import { useLogout, useSession } from "../lib/session";
import { useT } from "../lib/i18n";

const navItems = [
  { to: "/lobby", icon: Radio, label: "lobby" },
  { to: "/game/local", icon: Gamepad2, label: "game" },
  { to: "/profile", icon: UserRound, label: "profile" },
  { to: "/records", icon: Trophy, label: "records" },
  { to: "/settings", icon: Settings, label: "settings" }
] as const;

export function AppShell() {
  const { data, isLoading, isError } = useSession();
  const logout = useLogout();
  const t = useT();

  if (isLoading) return <div className="arcade-bg grid min-h-screen place-items-center text-neon">Booting...</div>;
  if (isError || !data?.user) return <Navigate to="/login" replace />;

  return (
    <div className="arcade-bg min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-1/2 grid-floor opacity-50" />
      <div className="relative z-10 grid min-h-screen grid-cols-[88px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-white/10 bg-black/30 px-3 py-5 backdrop-blur">
          <div className="mb-8 hidden px-3 text-2xl font-black tracking-normal text-white lg:block">GalaxyPong</div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                      isActive ? "bg-neon/15 text-neon shadow-neon" : "text-white/70 hover:bg-white/10 hover:text-white"
                    ].join(" ")
                  }
                >
                  <Icon size={20} />
                  <span className="hidden lg:inline">{t(item.label)}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="mt-8 flex h-12 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/70 hover:bg-flare/15 hover:text-flare"
          >
            <LogOut size={20} />
            <span className="hidden lg:inline">{t("logout")}</span>
          </button>
        </aside>

        <main className="min-w-0 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
