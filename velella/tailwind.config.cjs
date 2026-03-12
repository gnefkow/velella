const kitConfig = require("../../counterfoil-kit/tailwind.config.cjs");

module.exports = {
  ...kitConfig,

  // Ensure Tailwind scans *this app* plus the toolkit source (since it's a sibling repo).
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../counterfoil-kit/src/**/*.{js,jsx,ts,tsx}",
  ],
};