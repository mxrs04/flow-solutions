/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './partials/*.html', './assets/js/*.js'],
  theme: {
    extend: {
      colors: {
        darkbg: '#0C0C0C',
        lexia: {
          DEFAULT: '#32F3DD',
          deep: '#14b8a6',
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
