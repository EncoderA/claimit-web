import colors from './colors';
import spacing from './spacing';
import typography from './typography';

const theme = {
  colors,
  spacing,
  typography,
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.75rem',
    pill: '9999px',
  },
  shadows: {
    small: '0 1px 2px rgba(15, 23, 42, 0.08)',
    medium: '0 8px 24px rgba(15, 23, 42, 0.08)',
    large: '0 16px 40px rgba(15, 23, 42, 0.12)',
  },
  transitions: {
    fast: '120ms ease-in-out',
    normal: '220ms ease-in-out',
    slow: '320ms ease-in-out',
  },
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    tooltip: 1200,
  },
};

export default theme;
