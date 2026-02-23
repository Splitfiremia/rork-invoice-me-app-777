import { AppNotification } from '@/src/modules/notifications/types';
import { useNotificationStore } from '@/src/store/notification.store';

class NotificationService {
  async getAll(): Promise<AppNotification[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useNotificationStore.getState();
    return store.notifications;
  }

  async markAsRead(id: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const store = useNotificationStore.getState();
    store.markAsRead(id);
  }

  async markAllAsRead(): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = useNotificationStore.getState();
    store.markAllAsRead();
  }
}

export const notificationService = new NotificationService();
