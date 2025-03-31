import { create } from 'zustand';

interface SettingsState {
  fontSize: number;
  isDarkMode: boolean;
  autoAdvance: boolean;
  setFontSize: (size: number) => void;
  setDarkMode: (isDark: boolean) => void;
  setAutoAdvance: (auto: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 18,
  isDarkMode: false,
  autoAdvance: false,
  setFontSize: (size) => set({ fontSize: size }),
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setAutoAdvance: (auto) => set({ autoAdvance: auto }),
}));