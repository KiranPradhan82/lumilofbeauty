import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewType = 'home' | 'services' | 'booking' | 'dashboard' | 'admin' | 'about'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  role: string
}

interface AppState {
  currentView: ViewType
  user: User | null
  selectedServiceIds: string[]
 authModalOpen: boolean
  authModalMode: 'login' | 'register'
  setCurrentView: (view: ViewType) => void
  setUser: (user: User | null) => void
  setSelectedServiceIds: (ids: string[]) => void
  setAuthModalOpen: (open: boolean) => void
  setAuthModalMode: (mode: 'login' | 'register') => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'home' as ViewType,
      user: null,
      selectedServiceIds: [] as string[],
      authModalOpen: false,
      authModalMode: 'login' as const,
      setCurrentView: (view) => set({ currentView: view }),
      setUser: (user) => set({ user }),
      setSelectedServiceIds: (ids) => set({ selectedServiceIds: ids }),
      setAuthModalOpen: (open) => set({ authModalOpen: open }),
      setAuthModalMode: (mode) => set({ authModalMode: mode }),
      logout: () => set({ user: null, currentView: 'home' as ViewType }),
    }),
    {
      name: 'lumil-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
