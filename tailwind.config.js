/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#ffdad6",
        "secondary-container": "#febb2d",
        "on-primary-container": "#ffeeec",
        "secondary-fixed": "#ffdea9",
        "on-tertiary-fixed": "#1c1b1b",
        "on-secondary-fixed": "#271900",
        "on-error": "#ffffff",
        "on-secondary": "#ffffff",
        "on-tertiary-fixed-variant": "#474746",
        "tertiary-fixed": "#e5e2e1",
        "primary-container": "#d71e28",
        "tertiary-fixed-dim": "#c8c6c5",
        "on-tertiary-container": "#f5f1f1",
        "surface-container": "#eeeeee",
        "on-background": "#1a1c1c",
        "surface-container-lowest": "#ffffff",
        "inverse-on-surface": "#f1f1f1",
        "surface-tint": "#c0011b",
        "error": "#ba1a1a",
        "surface-dim": "#dadada",
        "background": "#f9f9f9",
        "on-secondary-fixed-variant": "#5e4100",
        "inverse-primary": "#ffb3ad",
        "on-primary": "#ffffff",
        "inverse-surface": "#2f3131",
        "primary-fixed-dim": "#ffb3ad",
        "on-tertiary": "#ffffff",
        "outline-variant": "#e6bdb9",
        "on-primary-fixed": "#410003",
        "surface-variant": "#e2e2e2",
        "surface-container-low": "#f3f3f3",
        "on-primary-fixed-variant": "#930011",
        "secondary": "#7d5800",
        "on-error-container": "#93000a",
        "tertiary-container": "#6f6e6e",
        "surface-container-highest": "#e2e2e2",
        "surface-container-high": "#e8e8e8",
        "primary": "#af0017",
        "secondary-fixed-dim": "#febb2d",
        "surface": "#f9f9f9",
        "tertiary": "#565656",
        "outline": "#916f6c",
        "surface-bright": "#f9f9f9",
        "on-surface-variant": "#5c3f3d",
        "on-surface": "#1a1c1c",
        "on-secondary-container": "#6d4c00",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "0px", // Strict sharp shapes rule
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "32px",
        "xs": "4px",
        "lg": "40px",
        "xl": "64px",
        "margin-mobile": "16px",
        "sm": "12px",
        "md": "24px",
        "base": "8px",
        "container-max": "1200px",
        "gutter": "24px"
      },
      fontFamily: {
        "balance-display": ["Work Sans", "sans-serif"],
        "label-sm": ["Work Sans", "sans-serif"],
        "headline-lg": ["Work Sans", "sans-serif"],
        "headline-md": ["Work Sans", "sans-serif"],
        "body-lg": ["Work Sans", "sans-serif"],
        "display-lg": ["Work Sans", "sans-serif"],
        "headline-lg-mobile": ["Work Sans", "sans-serif"],
        "body-md": ["Work Sans", "sans-serif"]
      },
      fontSize: {
        "balance-display": ["36px", { lineHeight: "44px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: []
};
