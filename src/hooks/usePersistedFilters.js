import { useEffect, useState } from 'react';

const readStoredFilters = (key, initialFilters) => {
  if (typeof window === 'undefined') return initialFilters;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return initialFilters;
    const parsed = JSON.parse(stored);
    if (import.meta.env.DEV) console.log('filtres restaurés', { key, parsed });
    return { ...initialFilters, ...parsed };
  } catch (error) {
    console.error('Erreur lecture filtres localStorage:', { key, error });
    return initialFilters;
  }
};

export default function usePersistedFilters(key, initialFilters) {
  const [filters, setFilters] = useState(() => readStoredFilters(key, initialFilters));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(filters));
    } catch (error) {
      console.error('Erreur sauvegarde filtres localStorage:', { key, error });
    }
  }, [filters, key]);

  const resetFilters = (nextFilters = initialFilters) => {
    setFilters(nextFilters);
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur suppression filtres localStorage:', { key, error });
    }
  };

  return [filters, setFilters, resetFilters];
}
