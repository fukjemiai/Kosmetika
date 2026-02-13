import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6b5b95',
      light: '#9b8cb5',
      dark: '#4a3d6b',
      contrastText: '#fff',
    },
    secondary: {
      main: '#d4a0a0',
      light: '#e8c4c4',
      dark: '#b07878',
    },
    background: {
      default: '#f5f5fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none', boxShadow: '2px 0 12px rgba(0,0,0,0.05)' },
      },
    },
  },
});
