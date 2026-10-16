/**
 * The product page must not fall back to its loading skeleton when its loader
 * re-runs.
 *
 * `router.invalidate()` after a cart change re-runs the product route loader,
 * which returns a new, pending `relatedProducts` promise. TanStack's `Await`
 * only adds a Suspense boundary for a truthy `fallback`, so with
 * `fallback={null}` the pending promise suspended the whole route into its
 * `pendingComponent`. The page now gives the section its own boundary and
 * defers the promise, so the page and the current related products stay on
 * screen. The repository has no DOM test runner, so this asserts the contract
 * statically.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const pageFile = path.join(
    import.meta.dirname, '..', '..', 'src', 'features', 'products', 'routes', 'page.tsx',
);

async function parse(file) {
    const source = await readFile(file, 'utf8');
    return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function walk(node, visit) {
    visit(node);
    ts.forEachChild(node, (child) => walk(child, visit));
}

function tagName(node) {
    const tag = ts.isJsxElement(node)
        ? node.openingElement.tagName
        : ts.isJsxSelfClosingElement(node)
          ? node.tagName
          : null;
    return tag && ts.isIdentifier(tag) ? tag.text : null;
}

function attribute(element, name) {
    const attributes = ts.isJsxElement(element)
        ? element.openingElement.attributes
        : element.attributes;
    return attributes.properties.find(
        (prop) => ts.isJsxAttribute(prop) && prop.name.getText() === name,
    );
}

/** True when the attribute is present and its value is not the literal `null`. */
function hasRealFallback(element) {
    const fallback = attribute(element, 'fallback');
    if (!fallback?.initializer || !ts.isJsxExpression(fallback.initializer)) return false;
    const expression = fallback.initializer.expression;
    return Boolean(expression) && expression.kind !== ts.SyntaxKind.NullKeyword;
}

function insideSuspense(node) {
    for (let parent = node.parent; parent; parent = parent.parent) {
        if (tagName(parent) === 'Suspense') return true;
    }
    return false;
}

test('the product page awaits related products inside its own boundary, from a deferred promise', async () => {
    const sourceFile = await parse(pageFile);

    const deferred = new Set();
    const awaits = [];
    walk(sourceFile, (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.initializer &&
            ts.isCallExpression(node.initializer) &&
            ts.isIdentifier(node.initializer.expression) &&
            node.initializer.expression.text === 'useDeferredValue'
        ) {
            deferred.add(node.name.text);
        }
        if (tagName(node) === 'Await') awaits.push(node);
    });

    assert.ok(awaits.length > 0, 'expected the product page to await related products');
    for (const element of awaits) {
        assert.ok(
            insideSuspense(element) || hasRealFallback(element),
            '<Await> needs a <Suspense> ancestor or a non-null fallback, or it suspends the whole route',
        );
        const promise = attribute(element, 'promise');
        const expression = promise?.initializer && ts.isJsxExpression(promise.initializer)
            ? promise.initializer.expression
            : undefined;
        assert.ok(
            expression && ts.isIdentifier(expression) && deferred.has(expression.text),
            '<Await> must render the deferred promise',
        );
    }
});
