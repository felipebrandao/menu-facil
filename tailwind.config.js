/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        "background-light": "#F9FAFB",
        "background-dark": "#1F2937",
        "card-light": "#FFFFFF",
        "card-dark": "#374151",
        "text-light": "#111827",
        "text-dark": "#F9FAFB",
        "subtext-light": "#6B7280",
        "subtext-dark": "#D1D5DB",
        'surface-light': '#FFFFFF',
        'surface-dark': '#1F2937',
        'border-light': '#E5E7EB',
        'border-dark': '#374151'
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
