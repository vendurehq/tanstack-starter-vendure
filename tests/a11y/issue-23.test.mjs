// Regression tests for issue #23: Lighthouse reported a missing main landmark
// and several links that share the accessible name "Vendure" while pointing at
// different destinations.
import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const sourceRoot = path.join(root, 'src');
const rootRouteFile = path.join(sourceRoot, 'routes', '__root.tsx');
const LINK_TAGS = new Set(['a', 'Link', 'NavigationLink']);
const IMAGE_TAGS = new Set(['img', 'Image']);

async function findComponentFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await findComponentFiles(file));
        if (entry.isFile() && entry.name.endsWith('.tsx')) files.push(file);
    }
    return files;
}

async function parseFile(file) {
    const content = await readFile(file, 'utf8');
    return ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function eachNode(node, visit) {
    visit(node);
    node.forEachChild(child => eachNode(child, visit));
}

function elementName(node) {
    if (ts.isJsxElement(node)) return node.openingElement.tagName.getText();
    if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText();
    return null;
}

function elementAttributes(node) {
    if (ts.isJsxElement(node)) return node.openingElement.attributes.properties;
    if (ts.isJsxSelfClosingElement(node)) return node.attributes.properties;
    return [];
}

/** Returns the literal value of an attribute, or undefined when it is absent or computed. */
function literalAttribute(node, name) {
    for (const attribute of elementAttributes(node)) {
        if (!ts.isJsxAttribute(attribute) || attribute.name.getText() !== name) continue;
        const initializer = attribute.initializer;
        if (initializer && ts.isStringLiteral(initializer)) return initializer.text;
        if (initializer && ts.isJsxExpression(initializer) && initializer.expression
            && ts.isStringLiteral(initializer.expression)) {
            return initializer.expression.text;
        }
        return undefined;
    }
    return undefined;
}

function hasAttribute(node, name) {
    return elementAttributes(node).some(attribute =>
        ts.isJsxAttribute(attribute) && attribute.name.getText() === name);
}

/**
 * Approximates the accessible name of a link from its literal content.
 * Returns null when any part of the name is computed at runtime, because such
 * names cannot be compared without rendering.
 */
function accessibleName(node) {
    const label = literalAttribute(node, 'aria-label');
    if (label !== undefined) return label;
    if (hasAttribute(node, 'aria-label') || hasAttribute(node, 'aria-labelledby')) return null;
    if (!ts.isJsxElement(node)) return null;

    const parts = [];
    let computed = false;
    for (const child of node.children) {
        if (ts.isJsxText(child)) {
            if (child.text.trim()) parts.push(child.text.trim());
            continue;
        }
        if (ts.isJsxExpression(child)) {
            if (child.expression) computed = true;
            continue;
        }
        const name = elementName(child);
        if (name && IMAGE_TAGS.has(name)) {
            const alt = literalAttribute(child, 'alt');
            if (alt === undefined) computed = true;
            else if (alt.trim()) parts.push(alt.trim());
            continue;
        }
        computed = true;
    }
    if (computed || parts.length === 0) return null;
    return parts.join(' ').replaceAll(/\s+/g, ' ').toLowerCase();
}

function linkDestination(node) {
    return literalAttribute(node, 'href') ?? literalAttribute(node, 'to');
}

test('the root shell wraps routed content in a main landmark', async () => {
    const source = await parseFile(rootRouteFile);
    const landmarks = [];
    eachNode(source, node => {
        if (elementName(node) === 'main') landmarks.push(node);
    });

    assert.equal(landmarks.length, 1, 'The root shell must declare exactly one main landmark.');
    const [landmark] = landmarks;

    const wrapsRoutedContent = ts.isJsxElement(landmark) && landmark.children.some(child =>
        ts.isJsxExpression(child) && child.expression && child.expression.getText() === 'children');
    assert.ok(wrapsRoutedContent, 'The main landmark must wrap the routed children.');

    let inLocaleLayout = false;
    for (let parent = landmark.parent; parent; parent = parent.parent) {
        if (elementName(parent) === 'LocaleLayout') inLocaleLayout = true;
    }
    assert.ok(inLocaleLayout, 'The main landmark must sit inside the locale layout, not around the site chrome.');
});

test('no page or layout nests a second main landmark', async () => {
    const violations = [];
    for (const directory of ['routes', 'site', 'features']) {
        for (const file of await findComponentFiles(path.join(sourceRoot, directory))) {
            if (file === rootRouteFile) continue;
            const source = await parseFile(file);
            eachNode(source, node => {
                if (elementName(node) === 'main') violations.push(path.relative(root, file));
            });
        }
    }
    assert.deepEqual(violations, [], 'Only the root shell may render a main landmark.');
});

test('site chrome links that share an accessible name share a destination', async () => {
    const destinations = new Map();
    for (const file of await findComponentFiles(path.join(sourceRoot, 'site'))) {
        const source = await parseFile(file);
        eachNode(source, node => {
            const tag = elementName(node);
            if (!tag || !LINK_TAGS.has(tag)) return;
            const destination = linkDestination(node);
            const name = accessibleName(node);
            if (destination === undefined || name === null) return;
            const known = destinations.get(name) ?? new Set();
            known.add(destination);
            destinations.set(name, known);
        });
    }

    const ambiguous = [...destinations]
        .filter(([, known]) => known.size > 1)
        .map(([name, known]) => `"${name}" points to ${[...known].sort().join(' and ')}`);
    assert.deepEqual(ambiguous, [], 'Links with different destinations need distinguishable accessible names.');
});
