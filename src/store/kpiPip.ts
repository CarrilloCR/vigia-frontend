import { create } from 'zustand'

interface KpiPipItem {
  tipo: string
  label: string
  color: string
  unit: string
  datos: { fecha: string; valor: number }[]
  ultimoValor: number
}

interface KpiPipStore {
  visible: boolean
  size: 'mini' | 'normal' | 'grande'
  allKpis: KpiPipItem[]
  currentIndex: number
  show: (kpis: KpiPipItem[], startIndex?: number) => void
  hide: () => void
  next: () => void
  prev: () => void
  setSize: (size: 'mini' | 'normal' | 'grande') => void
  // Getter helpers
  currentKpi: () => KpiPipItem | null
}

export const useKpiPipStore = create<KpiPipStore>((set, get) => ({
  visible: false,
  size: 'normal',
  allKpis: [],
  currentIndex: 0,
  show: (kpis, startIndex = 0) => set({ visible: true, allKpis: kpis, currentIndex: startIndex }),
  hide: () => set({ visible: false, allKpis: [], currentIndex: 0 }),
  next: () => set(s => ({ currentIndex: (s.currentIndex + 1) % s.allKpis.length })),
  prev: () => set(s => ({ currentIndex: (s.currentIndex - 1 + s.allKpis.length) % s.allKpis.length })),
  setSize: (size) => set({ size }),
  currentKpi: () => {
    const s = get()
    return s.allKpis[s.currentIndex] || null
  },
}))
