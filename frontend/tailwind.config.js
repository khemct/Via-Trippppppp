/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
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
        brand: 'var(--color-brand)',
        'brand-hover': 'var(--color-brand-hover)',
        'brand-text': 'var(--color-brand-text)',
        'brand-light': 'var(--color-brand-light)',
      },
    },
  },
  plugins: [],
};
