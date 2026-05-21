import { create } from "zustand";
import type { Locale } from "@galaxy-pong/shared";

const messages = {
  ko: {
    lobby: "로비",
    game: "게임",
    profile: "프로필",
    records: "전적",
    settings: "설정",
    logout: "로그아웃",
    quickMatch: "빠른 대전",
    waiting: "상대 찾는 중",
    onlinePilots: "온라인 플레이어",
    chat: "채팅",
    send: "전송",
    login: "로그인",
    register: "회원가입",
    email: "이메일",
    username: "사용자명",
    password: "비밀번호",
    code: "인증 코드",
    startVerification: "이메일 인증 시작",
    completeRegistration: "가입 완료",
    statusMessage: "상태 메시지",
    save: "저장",
    language: "언어"
  },
  en: {
    lobby: "Lobby",
    game: "Game",
    profile: "Profile",
    records: "Records",
    settings: "Settings",
    logout: "Log out",
    quickMatch: "Quick match",
    waiting: "Finding opponent",
    onlinePilots: "Online players",
    chat: "Chat",
    send: "Send",
    login: "Log in",
    register: "Register",
    email: "Email",
    username: "Username",
    password: "Password",
    code: "Code",
    startVerification: "Start email verification",
    completeRegistration: "Complete registration",
    statusMessage: "Status message",
    save: "Save",
    language: "Language"
  }
} as const;

type I18nStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useI18n = create<I18nStore>((set) => ({
  locale: (localStorage.getItem("locale") as Locale) || "ko",
  setLocale: (locale) => {
    localStorage.setItem("locale", locale);
    set({ locale });
  }
}));

export function useT() {
  const locale = useI18n((state) => state.locale);
  return (key: keyof typeof messages.ko) => messages[locale][key];
}
