// Coverage for the mobile purchase bar on configurable product pages (issue #19).
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {getLowestVariantPrice, getSelectedOptionNames} from '../../src/features/products/product-options.ts';

const root = path.join(import.meta.dirname, '..', '..');
const productInfoPath = path.join(root, 'src/features/products/components/product-info.tsx');
const productPagePath = path.join(root, 'src/features/products/routes/page.tsx');

const optionGroups = [
    {id: 'group-size', options: [{id: 'option-small', name: 'Small'}, {id: 'option-large', name: 'Large'}]},
    {id: 'group-color', options: [{id: 'option-red', name: 'Red'}, {id: 'option-blue', name: 'Blue'}]},
];

test('the purchase bar reports the chosen options in option group order', () => {
    assert.deepEqual(
        getSelectedOptionNames(optionGroups, {'group-color': 'option-blue', 'group-size': 'option-large'}),
        ['Large', 'Blue'],
    );
});

test('the purchase bar reports a partial selection and ignores unknown options', () => {
    assert.deepEqual(getSelectedOptionNames(optionGroups, {'group-size': 'option-small'}), ['Small']);
    assert.deepEqual(getSelectedOptionNames(optionGroups, {'group-size': 'option-removed'}), []);
    assert.deepEqual(getSelectedOptionNames(optionGroups, {}), []);
});

test('the purchase bar falls back to the lowest variant price', () => {
    assert.equal(getLowestVariantPrice([{priceWithTax: 2500}, {priceWithTax: 1900}, {priceWithTax: 3400}]), 1900);
    assert.equal(getLowestVariantPrice([{priceWithTax: 1900}]), 1900);
    assert.equal(getLowestVariantPrice([]), null);
});

test('one purchase action is exposed per breakpoint', async () => {
    const source = await readFile(productInfoPath, 'utf8');

    const actions = source.match(/onClick=\{handleAddToCart\}/g) ?? [];
    assert.equal(actions.length, 2, 'the inline action and the purchase bar must share one handler');

    const inlineAction = source.match(/className="hidden lg:block[^"]*"/g) ?? [];
    assert.equal(inlineAction.length, 1, 'the inline action must stay hidden below the lg breakpoint');

    const purchaseBar = source.match(/className="lg:hidden fixed[^"]*"/g) ?? [];
    assert.equal(purchaseBar.length, 1, 'the purchase bar must stay hidden from the lg breakpoint upwards');

    const disabledStates = source.match(/disabled=\{!canAddToCart \|\| isPending\}/g) ?? [];
    assert.equal(disabledStates.length, 2, 'both actions must share the select-options, stock and pending states');
});

test('an in-flight add to cart request rejects further taps', async () => {
    const source = await readFile(productInfoPath, 'utf8');
    assert.match(source, /if \(!selectedVariant \|\| isSubmitting\.current\) return;/);
    assert.match(source, /isSubmitting\.current = true;/);
    assert.match(source, /finally \{\s*isSubmitting\.current = false;/);
});

test('the purchase bar clears the browser safe area and the product page reserves its height', async () => {
    const barSource = await readFile(productInfoPath, 'utf8');
    assert.match(barSource, /pb-\[env\(safe-area-inset-bottom\)\]/);

    const pageSource = await readFile(productPagePath, 'utf8');
    assert.match(pageSource, /pb-\[calc\([^\]]*env\(safe-area-inset-bottom\)\)\] lg:pb-0/);
});

test('the purchase bar messages exist in every locale', async () => {
    for (const locale of ['en', 'de']) {
        const messages = JSON.parse(
            await readFile(path.join(root, `src/features/products/messages/${locale}.json`), 'utf8'),
        );
        assert.ok(messages.Product_purchaseBarLabel, `${locale} must name the purchase bar region`);
        assert.match(messages.Product_chooseOptions, /\{options\}/, `${locale} must list the option groups`);
    }
});
