const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        subtle: token('subtle'),
        line: token('line'),
        primary: {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          soft: token('primary-soft'),
          fg: token('primary-fg'),
        },
        accent: token('accent'),
        secondary: token('secondary'),
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
        info: token('info'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(20 24 31 / 0.04)',
        pop: '0 16px 40px -12px rgb(20 24 31 / 0.22), 0 2px 6px rgb(20 24 31 / 0.06)',
      },
    },
  },
  plugins: [],
};
