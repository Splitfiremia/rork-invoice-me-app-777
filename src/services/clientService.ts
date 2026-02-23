import { Client } from '@/src/modules/clients/types';
import { useClientStore } from '@/src/store/client.store';

class ClientService {
  async getAll(): Promise<Client[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useClientStore.getState();
    return store.clients;
  }

  async getById(id: string): Promise<Client | undefined> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const store = useClientStore.getState();
    return store.clients.find((c) => c.id === id);
  }

  async create(data: Client): Promise<Client> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const store = useClientStore.getState();
    store.addClient(data);
    return data;
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const store = useClientStore.getState();
    store.updateClient(id, data);

    const updated = store.clients.find((c) => c.id === id);
    if (!updated) {
      throw new Error(`Client with id ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useClientStore.getState();
    store.deleteClient(id);
  }
}

export const clientService = new ClientService();
