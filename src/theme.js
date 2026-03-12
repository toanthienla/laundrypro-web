import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },

    secondary: {
      main: '#14b8a6',
      light: '#5eead4',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },

    success: {
      main: '#16a34a',
      light: '#4ade80',
    },

    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
    },

    error: {
      main: '#ef4444',
      light: '#f87171',
    },

    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },

    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },

  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
  },

  components: {
    MuiDataGrid: {
      styleOverrides: {
        cell: {
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
  },
});

export default theme;