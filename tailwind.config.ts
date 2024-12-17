import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sfPro: ["var(--font-sf-pro)"],
      },
      colors: {
        primary: {
          main: "var(--color-primary-main)",
          1: "var(--color-primary-1)",
          2: "var(--color-primary-2)",
          3: "var(--color-primary-3)",
          4: "var(--color-primary-4)",
          5: "var(--color-primary-5)",
          6: "var(--color-primary-6)",
          7: "var(--color-primary-7)",
          8: "var(--color-primary-8)",
          9: "var(--color-primary-9)",
          10: "var(--color-primary-10)",
          11: "var(--color-primary-11)",
        },
        error: {
          main: "var(--color-error-main)",
          1: "var(--color-error-1)",
          2: "var(--color-error-2)",
          3: "var(--color-error-3)",
          4: "var(--color-error-4)",
          5: "var(--color-error-5)",
        },
        warning: {
          main: "var(--color-warning-main)",
          1: "var(--color-warning-1)",
          2: "var(--color-warning-2)",
          3: "var(--color-warning-3)",
          4: "var(--color-warning-4)",
          5: "var(--color-warning-5)",
        },
        success: {
          main: "var(--color-success-main)",
          1: "var(--color-success-1)",
          2: "var(--color-success-2)",
          3: "var(--color-success-3)",
          4: "var(--color-success-4)",
          5: "var(--color-success-5)",
        },
        "black-neutral": "var(--color-neutral-black)",
        "white-neutral": "var(--color-neutral-white)",
        neutral: {
          1: "var(--color-neutral-1)",
          2: "var(--color-neutral-2)",
          3: "var(--color-neutral-3)",
          4: "var(--color-neutral-4)",
          5: "var(--color-neutral-5)",
          6: "var(--color-neutral-6)",
          7: "var(--color-neutral-7)",
          8: "var(--color-neutral-8)",
          9: "var(--color-neutral-9)",
          10: "var(--color-neutral-10)",
        },
      },
      width: {
        container: "1440px",
      },
      maxWidth: {
        container: "1440px",
      },
      boxShadow: {
        "custom-inset": "inset 0px -2px 0px 0px rgba(255, 255, 255, 0.2)",
      },
      backgroundImage: {
        "how-it-work": "url(/public/assets/icons/bg-how-it-work.svg)",
      },
      fontSize: {
        "26px-bold": [
          "26px",
          {
            lineHeight: "32px",
            fontWeight: "700",
          },
        ],
        "24px-bold": [
          "24px",
          {
            lineHeight: "30px",
            fontWeight: "700",
          },
        ],
        "22px-bold": [
          "22px",
          {
            lineHeight: "32px",
            fontWeight: "700",
          },
        ],
        "18px-bold": [
          "18px",
          {
            lineHeight: "24px",
            fontWeight: "700",
          },
        ],
        "16px-bold": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "700",
          },
        ],
        "14px-bold": [
          "14px",
          {
            lineHeight: "21px",
            fontWeight: "700",
          },
        ],
        "26px-medium": [
          "26px",
          {
            lineHeight: "32px",
            fontWeight: "500",
          },
        ],
        "24px-medium": [
          "24px",
          {
            lineHeight: "30px",
            fontWeight: "500",
          },
        ],
        "18px-medium": [
          "18px",
          {
            lineHeight: "24px",
            fontWeight: "500",
          },
        ],
        "16px-medium": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "500",
          },
        ],
        "14px-medium": [
          "14px",
          {
            lineHeight: "21px",
            fontWeight: "500",
          },
        ],
        "12px-medium": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
          },
        ],
        "12px-bold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "700",
          },
        ],
        "24px-normal": [
          "24px",
          {
            lineHeight: "30px",
            fontWeight: "400",
          },
        ],
        "18px-normal": [
          "18px",
          {
            lineHeight: "24px",
            fontWeight: "400",
          },
        ],
        "16px-normal": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "400",
          },
        ],
        "14px-normal": [
          "14px",
          {
            lineHeight: "21px",
            fontWeight: "400",
          },
        ],
        "12px-normal": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
          },
        ],
        "32px-bold": [
          "32px",
          {
            lineHeight: "40px",
            fontWeight: "700",
          },
        ],
        "32px-medium": [
          "32px",
          {
            lineHeight: "40px",
            fontWeight: "500",
          },
        ],
        "32px-normal": [
          "32px",
          {
            lineHeight: "40px",
            fontWeight: "400",
          },
        ],
        "20px-bold": [
          "20px",
          {
            lineHeight: "40px",
            fontWeight: "700",
          },
        ],
      },
      screens: {
        xs: "375px",
        "2xs": "400px",
        "3xs": "430px",
        sm: "640px",
        md: "768px",
        "2md": "896px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1900px",
      },
      filter: {
        white:
          "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(359deg) brightness(101%) contrast(101%)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".primary-box": {
          "border-radius": "256px",
          background: "#171717",
          "box-shadow": "0px 40px 32px -24px rgba(15, 15, 15, 0.12)",
          padding: "10.5px 20px",
        },
      });
    }),
    require("tailwindcss-filters"),
  ],
};
export default config;
