import { User } from '@/src/modules/auth/types';

const MOCK_USER: User = {
  id: 'demo-user-1',
  email: 'demo@invoiceme.com',
  fullName: 'Alex Johnson',
  businessName: 'Johnson Design Studio',
  phone: '+1 (555) 123-4567',
  address: '123 Creative Ave',
  city: 'San Francisco',
  state: 'CA',
  zip: '94102',
  country: 'US',
  currency: 'USD',
  taxRate: 8.5,
  createdAt: '2024-01-15T00:00:00Z',
};

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  businessName?: string;
}

interface AuthSession {
  user: User;
  accessToken: string;
}

type AuthCallback = (session: AuthSession | null) => void;

class AuthService {
  private authCallbacks: AuthCallback[] = [];

  async signIn(email: string, password: string): Promise<AuthSession> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Return mock session
    const session: AuthSession = {
      user: MOCK_USER,
      accessToken: 'mock-access-token',
    };

    // Notify listeners
    this.notifyAuthChange(session);

    return session;
  }

  async signUp(data: SignUpData): Promise<AuthSession> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Mock validation
    if (!data.email || !data.password || !data.fullName) {
      throw new Error('Email, password, and full name are required');
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      businessName: data.businessName || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      currency: 'USD',
      taxRate: 0,
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      user: newUser,
      accessToken: 'mock-access-token',
    };

    // Notify listeners
    this.notifyAuthChange(session);

    return session;
  }

  async signOut(): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Notify listeners
    this.notifyAuthChange(null);
  }

  async resetPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!email) {
      throw new Error('Email is required');
    }

    // In a real implementation, this would send a reset email
    // For now, we just simulate success
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // For mock implementation, we return null
    // In a real app, this would check for an active session
    return null;
  }

  onAuthStateChange(callback: AuthCallback): () => void {
    this.authCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.authCallbacks = this.authCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyAuthChange(session: AuthSession | null): void {
    this.authCallbacks.forEach((callback) => callback(session));
  }
}

export const authService = new AuthService();
