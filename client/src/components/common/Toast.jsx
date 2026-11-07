import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [t, setT] = useState({ open: false, msg: '', severity: 'success' });
  const show = useCallback((msg, severity = 'success') => setT({ open: true, msg, severity }), []);
  const close = () => setT((x) => ({ ...x, open: false }));
  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar open={t.open} autoHideDuration={4000} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={t.severity} variant="filled" onClose={close} sx={{ borderRadius: 2 }}>
          {t.msg}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
