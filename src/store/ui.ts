import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';

interface UiState {
  theme: Theme;
  density: Density;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  activeOrgId: string | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setActiveOrg: (id: string | null) => void;
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      theme: (document.documentElement.getAttribute('data-theme') as Theme) ?? 'dark',
      density: 'comfortable',
      sidebarCollapsed: false,
      commandOpen: false,
      activeOrgId: null,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
      setDensity: (density) => set({ density }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setActiveOrg: (activeOrgId) => set({ activeOrgId }),
    }),
    {
      name: 'ea-ui',
      // The theme also lives in its own key, read by the pre-paint script in
      // index.html - persisting it here keeps the two in sync after a toggle.
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          localStorage.setItem('ea-theme', state.theme);
          applyTheme(state.theme);
        }
      },
    },
  ),
);

// Mirror every theme change into the standalone key the boot script reads.
useUi.subscribe((state) => localStorage.setItem('ea-theme', state.theme));
