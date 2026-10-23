/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FDFBF7',
        sage: {
          50: '#F4F7F4',
          100: '#E7EFE7',
          500: '#52796F',
        },
        lavender: {
          50: '#F6F5FB',
          100: '#ECE9F7',
          500: '#7E74C4',
        },
        peach: {
          50: '#FFF7F2',
          100: '#FFEADB',
          500: '#E07A5F',
        },
        slate: {
          850: '#1e2430'
        }
      }
    },
  },
  plugins: [],
};
