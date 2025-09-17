import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh";
import en from "./locales/en";
const getInitialLang = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("lang") || "zh";
  }
  return "zh"; // 默认语言
};
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh }
  },
  lng: getInitialLang(),
  fallbackLng: "zh",
  interpolation: { escapeValue: false }
});

export default i18n;
