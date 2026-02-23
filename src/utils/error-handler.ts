import { Alert, Platform } from 'react-native';
import { logger } from './logger';

export function handleError(error: unknown, context?: string): string {
  let message = 'An unexpected error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  logger.error(`${context ?? 'Error'}: ${message}`, error);
  return message;
}

export function showErrorAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }
}
