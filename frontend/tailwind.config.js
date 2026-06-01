/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        card: 'var(--color-card)',
        input: 'var(--color-input)',
        deep: 'var(--color-deep)',
        heading: 'var(--color-heading)',
        body: 'var(--color-body)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        'line-strong': 'var(--color-line-strong)',
        brand: '#4a6741',
        'brand-hover': '#3d5a35',
        'brand-text': '#8aab7a',
        'brand-light': '#c8dbb8',
      },
    },
  },
  plugins: [],
};
