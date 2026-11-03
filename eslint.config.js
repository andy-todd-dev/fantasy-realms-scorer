// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

const wiring = ["./src/composition-root.ts", "./src/main.tsx"];
const application = "./src/application";
const infrastructure = "./src/infrastructure";
const driven = "./src/infrastructure/driven";
const driving = "./src/infrastructure/driving";

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
            { target: "./src/domain", from: [application, infrastructure, ...wiring] },
            { target: application, from: [infrastructure, ...wiring] },
            { target: driven, from: [application, driving, ...wiring] },
            { target: driving, from: [driven, ...wiring] },
          ],
        },
      ],
    },
  },
  restrictPackages(
    ["src/domain/**", "src/application/**"],
    [...reactPackages, ...reduxPackages, ...awilix],
  ),
  restrictPackages(["src/infrastructure/driven/**"], [...reduxPackages, ...awilix]),
  restrictPackages(["src/infrastructure/driving/**", "src/main.tsx"], awilix),
]);
