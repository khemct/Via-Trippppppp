/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#312f24',
        card: '#2a2820',
        input: '#252318',
        deep: '#1e1c14',
        heading: '#c8c4a0',
        body: '#a8a080',
        muted: '#8a8468',
        line: '#3e3b2a',
        'line-strong': '#4a4738',
        brand: '#4a6741',
        'brand-hover': '#3d5a35',
        'brand-text': '#8aab7a',
        'brand-light': '#c8dbb8',
      },
    },
  },
  plugins: [],
};
