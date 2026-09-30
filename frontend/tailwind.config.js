/** @type {import('tailwindcss').Config} */
// Ported 1:1 from the CDN version's js/tailwind-config.js (the `tailwind.config = {...}`
// object that used to be loaded via <script src="../js/tailwind-config.js"> before the
// Tailwind CDN <script> tag). Same theme extension, just wired in as a build-time config
// instead of a runtime one — visual output is unchanged.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { display: ['Newsreader', 'Georgia', 'serif'], body: ['Hanken Grotesk', 'system-ui', 'sans-serif'] },
      colors: {
        primary: '#065F46', 'primary-deep': '#044A37',
        cream: '#FDFBF7', 'cream-deep': '#F3EFE8',
        ink: '#1C1917', 'ink-soft': '#6F675F',
        violet: '#065F46', 'violet-deep': '#044A37',
        yellow: '#D3E1D6', coral: '#B4494F',
        teal: '#0B6B50', tangerine: '#B99A62',
        jade: '#065F46', tone: '#D3E1D6', tint: '#EEF3EE',
      },
      keyframes: {
        pop: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.35)' } },
        shimmer: { '0%': { backgroundPosition: '100% 0' }, '100%': { backgroundPosition: '0 0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(12px) scale(.96)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'toast-out': { to: { opacity: '0', transform: 'translateX(20px)' } },
      },
      animation: {
        pop: 'pop .35s ease', shimmer: 'shimmer 1.4s ease infinite',
        marquee: 'marquee 22s linear infinite',
        'toast-in': 'toast-in .25s ease', 'toast-out': 'toast-out .2s ease forwards',
      },
    },
  },
  plugins: [],
};
