/**
 * Issue #20 — the mobile portrait header must fit at 320 CSS pixels.
 *
 * The header markup is asserted statically: the repository has no DOM test
 * runner, so these tests parse the navbar sources and check the responsive and
 * touch-target contract that keeps menu, logo and cart on one row.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const navigationRoot = path.join(root, 'src', 'site', 'navigation');

/** Controls that must not consume header width below the md breakpoint. */
const DRAWER_ONLY_CONTROLS = [
    'LanguagePicker',
    'CurrencyPicker',
    'ThemeSwitcher',
    'NavbarUser',
];

/** Controls that must stay directly reachable in the mobile header. */
const ALWAYS_VISIBLE_CONTROLS = ['MobileNav', 'CartIcon'];

async function parse(file) {
    const source = await readFile(file, 'utf8');
    return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function elementName(node) {
    const tag = ts.isJsxSelfClosingElement(node)
        ? node.tagName
        : ts.isJsxElement(node)
          ? node.openingElement.tagName
          : null;
    return tag && ts.isIdentifier(tag) ? tag.text : null;
}

function classNameOf(node) {
    const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
    for (const attribute of opening.attributes.properties) {
        if (!ts.isJsxAttribute(attribute) || attribute.name.getText() !== 'className') continue;
        const value = attribute.initializer;
        if (value && ts.isStringLiteral(value)) return value.text;
        if (value && ts.isJsxExpression(value) && value.expression) return value.expression.getText();
    }
    return null;
}

function findElements(sourceFile, name) {
    const found = [];
    const visit = (node) => {
        if (elementName(node) === name) found.push(node);
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return found;
}

/** Every className applied to the element itself and to its JSX ancestors. */
function classNameChain(node) {
    const chain = [];
    for (let current = node; current; current = current.parent) {
        if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) {
            const className = classNameOf(current);
            if (className) chain.push(className);
        }
    }
    return chain;
}

const isHiddenByDefault = (className) => /(^|\s)hidden(\s|$)/.test(className);

test('the mobile header hides language, currency, theme and account controls', async () => {
    const navbar = await parse(path.join(navigationRoot, 'navbar.tsx'));
    for (const control of DRAWER_ONLY_CONTROLS) {
        const [element] = findElements(navbar, control);
        assert.ok(element, `navbar.tsx must render ${control}.`);
        const chain = classNameChain(element);
        assert.ok(
            chain.some(className => isHiddenByDefault(className) && /\bmd:(flex|block|inline-flex)\b/.test(className)),
            `${control} must sit inside a "hidden md:*" wrapper so it costs no width below md. Wrappers found: ${JSON.stringify(chain)}`,
        );
    }
});

test('the mobile header keeps the menu and the cart directly visible', async () => {
    const navbar = await parse(path.join(navigationRoot, 'navbar.tsx'));
    for (const control of ALWAYS_VISIBLE_CONTROLS) {
        const [element] = findElements(navbar, control);
        assert.ok(element, `navbar.tsx must render ${control}.`);
        assert.deepEqual(
            classNameChain(element).filter(isHiddenByDefault),
            [],
            `${control} must not be hidden at mobile widths.`,
        );
    }
});

test('the cart badge survives the mobile header layout', async () => {
    const source = await readFile(path.join(navigationRoot, 'navbar', 'cart-icon.tsx'), 'utf8');
    assert.match(source, /cartItemCount\s*>\s*0/, 'The cart badge must still be conditional on the item count.');
    assert.match(source, /\{cartItemCount\}/, 'The cart badge must still render the item count.');
});

test('header controls keep a 44px touch target on mobile and the desktop size above md', async () => {
    const cartIcon = await parse(path.join(navigationRoot, 'navbar', 'cart-icon.tsx'));
    const [cartButton] = findElements(cartIcon, 'Button');
    assert.ok(cartButton, 'cart-icon.tsx must render a Button.');
    assert.match(
        classNameOf(cartButton) ?? '',
        /\bsize-11\b.*\bmd:size-9\b/,
        'The cart button must be 44px on mobile and keep the 36px desktop size.',
    );

    const mobileNav = await parse(path.join(navigationRoot, 'navbar', 'mobile-nav.tsx'));
    const [trigger] = findElements(mobileNav, 'SheetTrigger');
    assert.ok(trigger, 'mobile-nav.tsx must render a SheetTrigger.');
    const triggerButton = findElements(trigger, 'Button').map(classNameOf).join(' ');
    assert.match(triggerButton, /\bsize-11\b/, 'The menu trigger must be a 44px touch target.');
    assert.match(triggerButton, /\bmd:hidden\b/, 'The menu trigger must stay hidden on desktop.');
});

test('the mobile drawer owns language, currency, theme and the authentication action', async () => {
    const mobileNav = await parse(path.join(navigationRoot, 'navbar', 'mobile-nav.tsx'));
    assert.equal(
        findElements(mobileNav, 'MobilePreferences').length,
        1,
        'The drawer must render the language, currency and theme controls.',
    );
    assert.equal(
        findElements(mobileNav, 'LoginButton').length,
        1,
        'The drawer must keep the sign in / sign out action reachable on mobile.',
    );

    const source = await readFile(path.join(navigationRoot, 'navbar', 'mobile-nav.tsx'), 'utf8');
    for (const route of ['/account/profile', '/account/orders', '/account/addresses']) {
        assert.ok(source.includes(route), `The drawer must keep the ${route} link.`);
    }
    assert.match(
        source,
        /rowClassName\s*=\s*\n?\s*'[^']*\bmin-h-11\b/,
        'Drawer rows must be at least 44px tall.',
    );
});

test('drawer preference options are 44px native radios with unambiguous labels', async () => {
    const preferences = await parse(path.join(navigationRoot, 'navbar', 'mobile-preferences.tsx'));

    const [option] = findElements(preferences, 'label');
    assert.ok(option, 'mobile-preferences.tsx must render option rows as labels.');
    assert.match(classNameOf(option) ?? '', /\bmin-h-11\b/, 'Preference rows must be at least 44px tall.');

    const radios = findElements(preferences, 'input');
    assert.ok(radios.length > 0, 'Preference rows must wrap a native radio input.');

    const source = await readFile(path.join(navigationRoot, 'navbar', 'mobile-preferences.tsx'), 'utf8');
    assert.ok(
        source.includes('code={code}'),
        'Currency options must show the ISO currency code, not a bare symbol.',
    );
    assert.ok(
        source.includes('Intl.DisplayNames'),
        'Currency options must pair the ISO code with a readable currency name.',
    );
    assert.ok(
        source.includes('availableCurrencyCodes.length > 1'),
        'A single-currency channel must not show a currency chooser.',
    );
});

test('drawer preference labels are translated in every locale', async () => {
    const required = [
        'Navigation_language',
        'Navigation_currency',
        'Navigation_theme',
        'Navigation_themeLight',
        'Navigation_themeDark',
        'Navigation_themeSystem',
        'Navigation_switchTheme',
    ];
    for (const locale of ['en', 'de']) {
        const messages = JSON.parse(
            await readFile(path.join(navigationRoot, 'messages', `${locale}.json`), 'utf8'),
        );
        for (const key of required) {
            assert.ok(messages[key], `${locale}.json is missing ${key}.`);
        }
    }
});
