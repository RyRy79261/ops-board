import base from "@opsboard/eslint-config";

export default [
  ...base,
  {
    ignores: ["**/.next/**", "**/out/**", "**/dist/**"],
  },
];
