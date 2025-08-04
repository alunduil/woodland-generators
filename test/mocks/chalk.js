// Mock implementation of chalk for Jest tests
const chalk = {
  // Basic colors
  red: (text) => text,
  green: (text) => text,
  blue: (text) => text,
  yellow: (text) => text,
  cyan: (text) => text,
  magenta: (text) => text,
  white: (text) => text,
  black: (text) => text,
  gray: (text) => text,
  grey: (text) => text,

  // Bright colors
  redBright: (text) => text,
  greenBright: (text) => text,
  blueBright: (text) => text,
  yellowBright: (text) => text,
  cyanBright: (text) => text,
  magentaBright: (text) => text,
  whiteBright: (text) => text,
  blackBright: (text) => text,

  // Background colors
  bgRed: (text) => text,
  bgGreen: (text) => text,
  bgBlue: (text) => text,
  bgYellow: (text) => text,
  bgCyan: (text) => text,
  bgMagenta: (text) => text,
  bgWhite: (text) => text,
  bgBlack: (text) => text,

  // Styles
  bold: (text) => text,
  dim: (text) => text,
  italic: (text) => text,
  underline: (text) => text,
  inverse: (text) => text,
  strikethrough: (text) => text,

  // Allow chaining
  __proto__: new Proxy(
    {},
    {
      get: () => (text) => text,
    },
  ),
};

// Make chalk chainable
Object.keys(chalk).forEach((key) => {
  if (typeof chalk[key] === "function") {
    Object.setPrototypeOf(chalk[key], chalk);
  }
});

module.exports = chalk;
module.exports.default = chalk;
