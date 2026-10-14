/**
 * The header must not flash its skeletons when the root loader re-runs.
 *
 * `router.invalidate()` after a cart or account change gives the navbar a new,
 * pending `personalized` promise. Awaiting that promise directly suspends the
 * cart badge and user menu back to their fallbacks. The navbar defers the
 * promise instead, so the resolved values stay on screen until the new ones
 * arrive. The repository has no DOM test runner, so this asserts the contract
 * statically.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const navbarFile = path.join(
    import.meta.dirname, '..', '..', 'src', 'site', 'navigation', 'navbar.tsx',
);

async function parse(file) {
    const source = await readFile(file, 'utf8');
    return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function walk(node, visit) {
    visit(node);
    ts.forEachChild(node, (child) => walk(child, visit));
}

/** Returns the identifier passed to `attribute` on every `tagName` element. */
function attributeIdentifiers(sourceFile, tagName, attribute) {
    const values = [];
    walk(sourceFile, (node) => {
        if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
        if (!ts.isIdentifier(node.tagName) || node.tagName.text !== tagName) return;
        for (const prop of node.attributes.properties) {
            if (!ts.isJsxAttribute(prop) || prop.name.getText() !== attribute) continue;
            const expression = prop.initializer && ts.isJsxExpression(prop.initializer)
                ? prop.initializer.expression
                : undefined;
            values.push(expression && ts.isIdentifier(expression) ? expression.text : null);
        }
    });
    return values;
}

test('the navbar renders its personalized data from a deferred promise', async () => {
    const sourceFile = await parse(navbarFile);

    const deferred = [];
    walk(sourceFile, (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            node.initializer &&
            ts.isCallExpression(node.initializer) &&
            ts.isIdentifier(node.initializer.expression) &&
            node.initializer.expression.text === 'useDeferredValue' &&
            ts.isIdentifier(node.name)
        ) {
            deferred.push(node.name.text);
        }
    });
    assert.equal(deferred.length, 1, 'expected one useDeferredValue() result in the navbar');
    const [deferredName] = deferred;

    const awaited = attributeIdentifiers(sourceFile, 'Await', 'promise');
    assert.ok(awaited.length > 0, 'expected the navbar to await personalized data');
    for (const name of awaited) {
        assert.equal(name, deferredName, 'every <Await> in the navbar must use the deferred promise');
    }

    const mobileNav = attributeIdentifiers(sourceFile, 'MobileNav', 'personalized');
    assert.deepEqual(mobileNav, [deferredName], 'MobileNav must receive the deferred promise');
});
