import { useState } from "react";
import "./App.css";
import { HomePage } from "./HomePage";
import { BenchmarkPage } from "./BenchmarkPage";
import { PromptsPage } from "./PromptsPage";
import { HistoryPage } from "./HistoryPage";
import { ProfilesPage } from "./ProfilesPage";
import { SettingsPage } from "./SettingsPage";

type View = "home" | "benchmark" | "prompts" | "history" | "profiles" | "settings";

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "benchmark",
    label: "Benchmark",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-8" />
      </svg>
    ),
  },
  {
    id: "prompts",
    label: "Prompts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "profiles",
    label: "Profiles",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const SETTINGS_NAV = {
  id: "settings" as View,
  label: "Settings",
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

function App() {
  const [view, setView] = useState<View>("home");

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar__logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-8" />
          </svg>
        </div>
        <div className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar__item${view === item.id ? " sidebar__item--active" : ""}`}
              onClick={() => setView(item.id)}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="sidebar__bottom">
          <button
            className={`sidebar__item${view === "settings" ? " sidebar__item--active" : ""}`}
            onClick={() => setView("settings")}
            title={SETTINGS_NAV.label}
          >
            {SETTINGS_NAV.icon}
          </button>
        </div>
      </nav>

      <main className="main-content">
        {view === "home" && <HomePage onNavigate={(v) => setView(v as View)} />}
        {view === "benchmark" && <BenchmarkPage />}
        {view === "prompts" && <PromptsPage />}
        {view === "history" && <HistoryPage />}
        {view === "profiles" && <ProfilesPage />}
        {view === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;
