/** @type {import('tailwindcss').Config} */
// Ported 1:1 from the CDN version's js/tailwind-config.js (the `tailwind.config = {...}`
// object that used to be loaded via <script src="../js/tailwind-config.js"> before the
// Tailwind CDN <script> tag). Same theme extension, just wired in as a build-time config
// instead of a runtime one — visual output is unchanged.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { display: ['Space Grotesk', 'system-ui', 'sans-serif'] },
      colors: {
        primary: '#6C3CE9', 'primary-deep': '#4A23B5',
        cream: '#FFF6E9', 'cream-deep': '#FFEAC2',
        ink: '#181229', 'ink-soft': '#4A4360',
        violet: '#6C3CE9', 'violet-deep': '#4A23B5',
        yellow: '#FFCD3C', coral: '#FF5C72',
        teal: '#00C2A8', tangerine: '#FF7A33',
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
