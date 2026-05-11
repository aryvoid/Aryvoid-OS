import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  }, [key, storedValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      return next;
    });
  }, []);

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function getDayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

export function getMonthName() {
  return new Date().toLocaleDateString('en-US', { month: 'long' });
}

export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

export function isMonday() {
  return new Date().getDay() === 1;
}

export function isSunday() {
  return new Date().getDay() === 0;
}

export function isSaturday() {
  return new Date().getDay() === 6;
}

export function getSeason() {
  const month = getCurrentMonth();
  if (month <= 3) return 'winter';
  if (month <= 6) return 'summer';
  if (month <= 9) return 'monsoon';
  return 'exam';
}
