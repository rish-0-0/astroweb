// jest.config.ts

import { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest', // Use ts-jest for TypeScript support
    testEnvironment: 'node', // Simulate a browser environment
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$', // Regex pattern to match test files
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest', // Transform TypeScript files using ts-jest
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'], // Recognize .ts, .tsx, .js, etc.
};

export default config;
