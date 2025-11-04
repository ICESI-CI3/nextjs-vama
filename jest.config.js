const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/_*.{js,jsx,ts,tsx}',
    // Excluir páginas de Next.js (tienen tests E2E)
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    // Excluir componentes grandes sin tests unitarios (tienen E2E)
    '!src/app/play/components/**/*.tsx',
    '!src/app/play/hooks/**/*.ts',
    '!src/app/play/utils/**/*.ts',
    '!src/app/game-sessions/**/*.tsx',
    '!src/app/rankings/**/*.tsx',
    '!src/app/reports/**/*.tsx',
    '!src/app/admin/**/*.tsx',
    '!src/app/dashboard/**/*.tsx',
    '!src/app/auth/**/*.tsx',
    '!src/app/my-trivias/[id]/**/*.tsx',
    // Excluir archivos de tipos
    '!src/types/**/*.ts',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

