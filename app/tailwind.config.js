/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // "media" (the default) makes NativeWind's web runtime throw "Cannot manually set color
  // scheme" on load. The app styles with theme tokens, not dark: classes, so this changes nothing.
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
}
