module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/tests/**'],
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testTimeout: 30000,
};
