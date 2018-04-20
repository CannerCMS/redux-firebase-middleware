module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:flowtype/recommended"
  ],
  parser: "babel-eslint",
  env: {
    browser: true,
    node: true
  },
  plugins: [
    "flowtype"
  ],
  rules: {
    "no-implicit-coercion": 0,
    "max-len": 0,
    "no-case-declarations": 0,
    "no-cond-assign": 0
  }
};
