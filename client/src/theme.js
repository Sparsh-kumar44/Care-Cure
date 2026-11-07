import { createTheme } from '@mui/material/styles';

const PALETTE = {
  light: {
    background: { default: '#f3f7f8', paper: '#ffffff' },
    text: { primary: '#14262b', secondary: '#5a6f75' },
    divider: '#e3ecee'
  },
  dark: {
    background: { default: '#0d1719', paper: '#142226' },
    text: { primary: '#e6f0f1', secondary: '#9bb0b5' },
    divider: '#243a3f'
  }
};

export const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#0e8f8a', light: '#4fc1bb', dark: '#096b67', contrastText: '#fff' },
      secondary: { main: '#3b5bdb' },
      success: { main: '#2e9e5b' },
      warning: { main: '#f08c00' },
      error: { main: '#e03131' },
      ...PALETTE[mode]
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } }
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: mode === 'light' ? '0 1px 2px rgba(20,38,43,.04), 0 6px 20px rgba(20,38,43,.04)' : 'none'
          })
        }
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            fontWeight: 600, color: theme.palette.text.secondary, fontSize: 12.5,
            backgroundColor: mode === 'light' ? '#f7fafb' : '#1a2c31',
            textTransform: 'uppercase', letterSpacing: '.04em'
          })
        }
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } }
    }
  });

export default buildTheme('light');
