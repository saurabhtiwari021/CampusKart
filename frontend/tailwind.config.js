/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { display: ['Newsreader', 'Georgia', 'serif'], body: ['Hanken Grotesk', 'system-ui', 'sans-serif'] },
      colors: {
        primary: '#0D6B4E', 'primary-deep': '#064D38',
        cream: '#FDFBF7', 'cream-deep': '#F3EFE8',
        ink: '#1C1917', 'ink-soft': '#6F675F',
        violet: '#0D6B4E', 'violet-deep': '#064D38',
        yellow: '#D3E1D6', coral: '#B4494F',
        teal: '#0B6B50', tangerine: '#C4A265',
        jade: '#0D6B4E', tone: '#D3E1D6', tint: '#EEF3EE',
        gold: '#C4A265', champagne: '#F0E4CC',
      },
      keyframes: {
        pop: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.35)' } },
        shimmer: { '0%': { backgroundPosition: '100% 0' }, '100%': { backgroundPosition: '0 0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(12px) scale(.96)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'toast-out': { to: { opacity: '0', transform: 'translateX(20px)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'pulse-glow': { '0%,100%': { boxShadow: '0 0 20px rgba(13,107,78,0.15)' }, '50%': { boxShadow: '0 0 40px rgba(13,107,78,0.15)' } },
        'gradient-shift': { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
      },
      animation: {
        pop: 'pop .35s ease', shimmer: 'shimmer 1.4s ease infinite',
        marquee: 'marquee 22s linear infinite',
        'toast-in': 'toast-in .25s ease', 'toast-out': 'toast-out .2s ease forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s infinite',
        'gradient-shift': 'gradient-shift 6s linear infinite',
      },
    },
  },
  plugins: [],
};
