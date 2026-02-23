import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@/src/modules/clients/types';
import { MOCK_CLIENTS } from '@/src/mocks/clients';

interface ClientStore {
  clients: Client[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      clients: MOCK_CLIENTS,
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
      updateClient: (id, data) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'client-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
