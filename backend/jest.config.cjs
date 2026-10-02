module.exports = {
  preset: 'ts-jest', testEnvironment: 'node', roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts'], testPathIgnorePatterns: ['integration.spec.ts'],
  clearMocks: true, testTimeout: 15000
};
