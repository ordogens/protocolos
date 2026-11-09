import { useCallback } from 'react';
import { storageService } from '@/services/storageService';

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const get = useCallback((): T => {
    return storageService.getItem(key, defaultValue);
  }, [key, defaultValue]);

  const set = useCallback((value: T): void => {
    storageService.setItem(key, value);
  }, [key]);

  const remove = useCallback((): void => {
    storageService.removeItem(key);
  }, []);

  return { get, set, remove };
};
