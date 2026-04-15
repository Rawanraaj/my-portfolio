/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0e0e13',
        surface: {
          DEFAULT: '#131318',
          low: '#1b1b20',
          mid: '#1f1f25',
          high: '#2a292f',
          highest: '#35343a',
        },
        gold: {
          DEFAULT: '#F5A623',
          light: '#ffc880',
          dim: '#ffb955',
        },
        teal: {
          DEFAULT: '#2DD4BF',
          dim: '#44e2cd',
        },
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
