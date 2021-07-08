module.exports = {
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    node: true
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 2020
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
  }
};
