/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#3457ff',
          600: '#2542db',
          700: '#1c33ad',
        },
      },
    },
  },
  plugins: [],
};
