import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { buildTheme } from './theme';

const ColorModeContext = createContext({ mode: 'light', toggle: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

const KEY = 'cc-color-mode';
const readStored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => readStored() || (prefersDark ? 'dark' : 'light'));

  useEffect(() => {
    try { localStorage.setItem(KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  const toggle = useCallback(() => setMode((m) => (m === 'light' ? 'dark' : 'light')), []);
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
