import {expect, test} from '@playwright/test';

test('navbar search input accepts keyboard input', async ({page}) => {
    await page.goto('/en/search?q=shoe');

    const searchInput = page.getByRole('searchbox', {name: 'Search products...'});
    await page.waitForFunction(() =>
        Object.keys(document.querySelector('input[type="search"]') ?? {}).some(key => key.startsWith('__react')),
    );
    await searchInput.click();
    await searchInput.press('ControlOrMeta+A');
    await searchInput.pressSequentially('boot', {delay: 150});
    await page.waitForTimeout(500);

    await expect(searchInput).toHaveValue('boot');
});

const browserErrors = new WeakMap<object, string[]>();

test.beforeEach(async ({page}) => {
    const errors: string[] = [];
    browserErrors.set(page, errors);
    page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', error => errors.push(error.message));
});

test.afterEach(async ({page}) => {
    const unexpected = (browserErrors.get(page) ?? []).filter(
        message => message !== 'Failed to load resource: the server responded with a status of 404 ()',
    );
    expect(unexpected).toEqual([]);
});

test('selects English at the root and renders both locales', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/Fixture Store/);

    await page.goto('/de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});

test('catalog search, empty cart, and missing products have stable behavior', async ({page}) => {
    await page.goto('/en/search?q=shoe');
    await expect(page).toHaveURL(/q=shoe/);
    await expect(page.locator('body')).toContainText(/shoe/i);

    await page.goto('/en');
    await page.getByRole('button', {name: /shopping cart/i}).click();
    await expect(page).toHaveURL(/\/en\/cart/);
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();

    const response = await page.goto('/en/product/not-in-fixture');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', {name: /Page Not Found/i})).toBeVisible();
});

test('client navigation settles after loading route server functions', async ({page}) => {
    await page.goto('/en');

    const serverFunctionRequests: string[] = [];
    page.on('request', request => {
        if (new URL(request.url()).pathname.startsWith('/_serverFn/')) {
            serverFunctionRequests.push(request.url());
        }
    });

    await page.getByRole('link', {name: 'Shop All'}).click();
    await expect(page).toHaveURL(/\/en\/search/);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();

    await page.waitForTimeout(500);
    const settledRequestCount = serverFunctionRequests.length;
    await page.waitForTimeout(500);

    expect(serverFunctionRequests.length).toBe(settledRequestCount);
    expect(serverFunctionRequests.length).toBeLessThanOrEqual(2);
});

test('account navigation is guarded and the API route is never localized', async ({page, request}) => {
    await page.goto('/en/account/orders');
    await expect(page).toHaveURL(/\/en\/sign-in\?redirectTo=/);

    const response = await request.post('/api/revalidate', {data: {tags: ['collections']}});
    expect(response.status()).toBe(500);
    expect(response.url()).toContain('/api/revalidate');
    expect(response.url()).not.toContain('/en/api/');
});
