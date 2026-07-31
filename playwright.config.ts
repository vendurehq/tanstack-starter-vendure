import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    use: {baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure'},
    projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
    webServer: [
        {
            command: 'node tests/e2e/shop-api-fixture.mjs',
            url: 'http://127.0.0.1:3900/health',
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'npm run dev -- --host 127.0.0.1',
            url: 'http://127.0.0.1:3000/en',
            reuseExistingServer: !process.env.CI,
            env: {
                VENDURE_SHOP_API_URL: 'http://127.0.0.1:3900/shop-api',
                SITE_URL: 'http://127.0.0.1:3000',
                SITE_NAME: 'Fixture Store',
            },
        },
    ],
});
