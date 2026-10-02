module.exports = {
  preset: 'ts-jest', testEnvironment: 'node', roots: ['<rootDir>/test'],
  testMatch: ['**/*.integration.spec.ts'], clearMocks: true, testTimeout: 30000
};
