// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const betterTailwindcss = require("eslint-plugin-better-tailwindcss");

const wiring = ["./src/composition-root.ts", "./src/main.tsx"];
const application = "./src/application";
const infrastructure = "./src/infrastructure";
const driven = "./src/infrastructure/driven";
const driving = "./src/infrastructure/driving";
const ui = "src/infrastructure/driving/ui";
const gluestack = `${ui}/gluestack/**`;
// Keep in step with `tailwindAttributes` in .prettierrc.json, which sorts the classes in these props.
const classProps = "^(?:className|contentContainerClassName)$";

const reactPackages = ["react", "react-*", "expo", "expo-*"];
const reduxPackages = ["@reduxjs/toolkit", "@reduxjs/toolkit/*", "react-redux"];
const awilix = ["awilix"];

function restrictPackages(files, group) {
  return {
    files,
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group }] }],
    },
  };
}

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "android/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/domain",
              from: [application, infrastructure, ...wiring],
            },
            { target: application, from: [infrastructure, ...wiring] },
            { target: driven, from: [application, driving, ...wiring] },
            { target: driving, from: [driven, ...wiring] },
          ],
        },
      ],
    },
  },
  {
    // Infrastructure may use domain types, but never calls domain functions.
    files: ["src/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/domain/*"],
              allowTypeImports: true,
              message:
                "Infrastructure may only use `import type` from the domain.",
            },
          ],
        },
      ],
    },
  },
  restrictPackages(
    ["src/domain/**", "src/application/**"],
    [...reactPackages, ...reduxPackages, ...awilix],
  ),
  restrictPackages(
    ["src/infrastructure/driven/**"],
    [...reduxPackages, ...awilix],
  ),
  restrictPackages(["src/infrastructure/driving/**", "src/main.tsx"], awilix),
  {
    // Catches mistyped class names, which React Native would otherwise silently ignore.
    // The copied Gluestack components are left out, as they carry classes for web and for tokens we don't define.
    files: [`${ui}/**/*.tsx`],
    ignores: [gluestack],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: `${ui}/global.css`,
        selectors: [
          { kind: "attribute", name: classProps },
          { kind: "attribute", name: classProps, match: [{ type: "strings" }] },
        ],
      },
    },
    rules: { "better-tailwindcss/no-unknown-classes": "error" },
  },
  {
    // Copied from Gluestack and re-copied on updates, so left in the form they come in.
    files: [gluestack],
    rules: { "import/no-duplicates": "off" },
  },
]);
