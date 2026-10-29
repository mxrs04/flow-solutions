/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./*.html', './partials/*.html', './assets/js/*.js'],
  theme: {
    extend: {
      colors: {
        darkbg: '#0C0C0C',
        // neutrale Grautöne statt des bläulichen Tailwind-"slate" – passt zu LEXIA-Türkis
        slate: colors.neutral,
        lexia: {
          DEFAULT: '#32F3DD',
          deep: '#14b8a6',
        },
        // Enterprise: warmes Champagner-Gold – edel, aber ruhiger als das Business-Türkis
        gold: {
          DEFAULT: '#F2D48B',
          deep: '#C9A24D',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
