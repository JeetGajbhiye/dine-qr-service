import React from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const change = (code) => { i18n.changeLanguage(code); localStorage.setItem("lang", code); };
  return (
    <div className="flex gap-1 bg-gray-100 rounded-full p-1">
      {LANGS.map((l) => (
        <button key={l.code} data-testid={`lang-${l.code}`} onClick={() => change(l.code)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            i18n.language === l.code ? "bg-white shadow text-gray-900" : "text-gray-500"
          }`}>{l.label}</button>
      ))}
    </div>
  );
}
