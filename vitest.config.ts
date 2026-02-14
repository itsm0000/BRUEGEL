import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.ts',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '~features': resolve(__dirname, './src/features'),
            '~components': resolve(__dirname, './src/components'),
            '~types': resolve(__dirname, './src/types'),
            '~utils': resolve(__dirname, './src/features/drawing/utils'),
        },
    },
})
