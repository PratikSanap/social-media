/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E99B00',
        secondary: '#8b6119',
        tertiary: '#F7BA3F',
      },
    },
  },
  plugins: [],
};
