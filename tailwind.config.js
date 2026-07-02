/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#081A3D',
        royal: '#123C8C',
        gold: '#D7A83A',
        mist: '#F3F6FA',
        ink: '#14213D',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(8, 26, 61, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
