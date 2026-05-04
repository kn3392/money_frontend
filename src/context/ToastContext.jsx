import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import Toast from '../components/ui/Toast.jsx';

let idSeq = 0;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${idSeq++}`;
    setItems((prev) => [...prev, { id, message, type }]);
    const ms = type === 'error' ? 5000 : 3200;
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, ms);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast items={items} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast requires ToastProvider');
  return ctx;
}
