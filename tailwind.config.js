/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          canvas: '#F6F3ED',
          sand: '#EFECE4',
          border: '#E3DFD5',
        },
        royal: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FBEBE6',
          500: '#EA580C',
          600: '#C2410C',
        },
        charcoal: {
          900: '#181716',
          800: '#2A2826',
          700: '#403D39',
          500: '#716C66',
          400: '#9B968E',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-glass': '0 8px 30px rgba(42, 40, 38, 0.05)',
        'royal-glow': '0 4px 20px rgba(37, 99, 235, 0.25)',
      },
    },
  },
  plugins: [],
};
