import { Estimate } from '@/src/modules/estimates/types';
import { useEstimateStore } from '@/src/store/estimate.store';

class EstimateService {
  async getAll(): Promise<Estimate[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useEstimateStore.getState();
    return store.estimates;
  }

  async getById(id: string): Promise<Estimate | undefined> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const store = useEstimateStore.getState();
    return store.estimates.find((est) => est.id === id);
  }

  async create(data: Estimate): Promise<Estimate> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const store = useEstimateStore.getState();
    store.addEstimate(data);
    return data;
  }

  async update(id: string, data: Partial<Estimate>): Promise<Estimate> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const store = useEstimateStore.getState();
    store.updateEstimate(id, data);

    const updated = store.estimates.find((est) => est.id === id);
    if (!updated) {
      throw new Error(`Estimate with id ${id} not found`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useEstimateStore.getState();
    store.deleteEstimate(id);
  }
}

export const estimateService = new EstimateService();
