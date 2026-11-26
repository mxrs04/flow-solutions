/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./*.html', './partials/*.html', './assets/js/*.js'],
  theme: {
    extend: {
      colors: {
        darkbg: '#0C0C0C',
        // neutrale Grautöne statt des bläulichen Tailwind-"slate" – schwarz-weiß (W0c, M10)
        // 500 etwas heller als Tailwind-Standard: kleine graue Schrift bleibt auf Schwarz gut lesbar (Kontrast > 4,5:1)
        slate: { ...colors.neutral, 500: '#8c8c8c' },
        lexia: {
          DEFAULT: '#FFFFFF',
          deep: '#D4D4D4',
        },
        // Enterprise: warmes Champagner-Gold – edel, aber ruhiger als das Business-Weiß
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
