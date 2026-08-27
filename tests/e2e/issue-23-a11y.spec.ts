import {expect, test} from '@playwright/test';

test('the storefront exposes one main landmark that excludes the site chrome', async ({page}) => {
    await page.goto('/en');

    const main = page.getByRole('main');
    await expect(main).toHaveCount(1);
    await expect(main.getByRole('banner')).toHaveCount(0);
    await expect(main.getByRole('contentinfo')).toHaveCount(0);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});

test('footer links named after Vendure name their destination', async ({page}) => {
    await page.goto('/en');

    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', {name: 'Vendure', exact: true})).toHaveAttribute('href', /\/en\/?$/);
    await expect(footer.getByRole('link', {name: 'Vendure.io', exact: true})).toHaveAttribute('href', 'https://vendure.io');
});
