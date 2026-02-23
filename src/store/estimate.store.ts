import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Estimate, EstimateFilter } from '@/src/modules/estimates/types';
import { MOCK_ESTIMATES } from '@/src/mocks/estimates';

interface EstimateStore {
  estimates: Estimate[];
  filter: EstimateFilter;
  setFilter: (filter: EstimateFilter) => void;
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (id: string, data: Partial<Estimate>) => void;
  deleteEstimate: (id: string) => void;
}

export const useEstimateStore = create<EstimateStore>()(
  persist(
    (set) => ({
      estimates: MOCK_ESTIMATES,
      filter: {},
      setFilter: (filter) => set({ filter }),
      addEstimate: (estimate) => set((state) => ({ estimates: [estimate, ...state.estimates] })),
      updateEstimate: (id, data) =>
        set((state) => ({
          estimates: state.estimates.map((est) => (est.id === id ? { ...est, ...data } : est)),
        })),
      deleteEstimate: (id) =>
        set((state) => ({
          estimates: state.estimates.filter((est) => est.id !== id),
        })),
    }),
    {
      name: 'estimate-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
