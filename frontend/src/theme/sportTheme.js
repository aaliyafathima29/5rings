import { createTheme } from '@mui/material/styles';

const sportTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#0B1120',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#0B1120',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 900,
      fontSize: '3.5rem',
      letterSpacing: '-1.5px',
      color: '#F8FAFC',
      '@media (max-width:600px)': {
        fontSize: '2.5rem'
      }
    },
    h2: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-1px',
      color: '#F8FAFC',
      '@media (max-width:600px)': {
        fontSize: '2rem'
      }
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#F8FAFC',
      '@media (max-width:600px)': {
        fontSize: '1.5rem'
      }
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      color: '#E2E8F0',
      '@media (max-width:600px)': {
        fontSize: '1.25rem'
      }
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#E2E8F0',
      '@media (max-width:600px)': {
        fontSize: '1.1rem'
      }
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#E2E8F0',
      '@media (max-width:600px)': {
        fontSize: '1rem'
      }
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.5px',
    },
    body1: {
      lineHeight: 1.7,
      color: '#CBD5E1',
    },
    body2: {
      lineHeight: 1.6,
      color: '#94A3B8',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: '1.05rem',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
          },
          '@media (max-width:600px)': {
            padding: '10px 24px',
            fontSize: '0.95rem'
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          color: '#FFFFFF',
          fontWeight: 700,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.5)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            boxShadow: '0 12px 24px -6px rgba(59, 130, 246, 0.6)',
          },
        },
        outlined: {
          border: '2px solid rgba(255,255,255,0.2)',
          color: '#F8FAFC',
          '&:hover': {
            border: '2px solid #3B82F6',
            background: 'rgba(59, 130, 246, 0.1)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', // Safari support
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 48px 0 rgba(0, 0, 0, 0.4)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 17, 32, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3B82F6',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

export default sportTheme;
