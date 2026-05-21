import { Panel } from "../components/Panel";
import { useI18n, useT } from "../lib/i18n";

export function SettingsPage() {
  const t = useT();
  const locale = useI18n((state) => state.locale);
  const setLocale = useI18n((state) => state.setLocale);

  return (
    <Panel className="max-w-xl">
      <h1 className="text-2xl font-black">{t("settings")}</h1>
      <label className="mt-6 block text-sm font-semibold text-white/70">
        {t("language")}
        <select
          className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-white"
          value={locale}
          onChange={(event) => setLocale(event.target.value as "ko" | "en")}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </label>
    </Panel>
  );
}
