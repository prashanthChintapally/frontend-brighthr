module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
  testMatch: ['<rootDir>/src/tests/*.test.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  verbose: true,
}
