import { create } from 'zustand';

interface SettingsState {
  fontSize: number;
  isDarkMode: boolean;
  autoAdvance: boolean;
  selectedVoice: string;
  setFontSize: (size: number) => void;
  setDarkMode: (isDark: boolean) => void;
  setAutoAdvance: (auto: boolean) => void;
  setSelectedVoice: (voice: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 18,
  isDarkMode: false,
  autoAdvance: false,
  selectedVoice: '',
  setFontSize: (size) => set({ fontSize: size }),
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setAutoAdvance: (auto) => set({ autoAdvance: auto }),
  setSelectedVoice: (voice) => set({ selectedVoice: voice }),
}));