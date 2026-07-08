import { useEffect, useRef, useState } from 'react';

const readStoredValue = (key, initialState) => {
  if (typeof window === 'undefined') return initialState;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored);
    if (import.meta.env.DEV) console.log('brouillon restauré', { key, parsed });
    return { ...initialState, ...parsed };
  } catch (error) {
    console.error('Erreur lecture brouillon localStorage:', { key, error });
    return initialState;
  }
};

export default function usePersistedForm(key, initialState) {
  const [form, setForm] = useState(() => readStoredValue(key, initialState));
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(form));
    } catch (error) {
      console.error('Erreur sauvegarde brouillon localStorage:', { key, error });
    }
  }, [form, key]);

  const resetForm = (nextState = initialState) => {
    skipNextSave.current = true;
    setForm(nextState);
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur suppression brouillon localStorage:', { key, error });
    }
  };

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur suppression brouillon localStorage:', { key, error });
    }
  };

  return [form, setForm, resetForm, clearDraft];
}
