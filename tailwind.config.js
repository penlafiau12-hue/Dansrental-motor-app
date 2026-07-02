/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1C1F26",
        paper: "#F7F3EC",
        accent: "#FF7A30",
        accent2: "#2FA88C",
        line: "#E4DFD2",
        muted: "#8A8577",
        danger: "#D64545",
        plate: "#F5C518",
      },
    },
  },
  plugins: [],
};
