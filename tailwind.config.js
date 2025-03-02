/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          100: '#ecfdf5',
          800: '#166534',
        },
        yellow: {
          100: '#fef9c3',
          800: '#854d0e',
        },
        red: {
          100: '#fee2e2',
          800: '#991b1b',
        },
        orange: {
          100: '#ffedd5',
          800: '#9a3412',
        },
      },
    },
  },
  plugins: [],
}
