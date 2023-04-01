module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  testPathIgnorePatterns: [
    "src/dev",
    "src/example"
  ]
};
