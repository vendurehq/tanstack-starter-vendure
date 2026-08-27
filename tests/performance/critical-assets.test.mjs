import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..', '..');
const sourceRoot = path.join(root, 'src');
const stylesheet = await readFile(path.join(sourceRoot, 'storefront.css'), 'utf8');

async function findSourceFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await findSourceFiles(file));
        if (entry.isFile() && /\.[jt]sx?$/.test(entry.name)) files.push(file);
    }
    return files;
}

test('critical CSS contains only the animation and state helpers used by the storefront', async () => {
    assert.doesNotMatch(stylesheet, /@import ["'](?:tw-animate-css|shadcn\/tailwind\.css)["']/);

    const source = (await Promise.all(
        (await findSourceFiles(sourceRoot)).map(file => readFile(file, 'utf8')),
    )).join('\n');
    const coreAnimations = new Set(['animate-none', 'animate-pulse', 'animate-spin']);
    const animationUtilities = new Set(
        [...source.matchAll(/\b(?:animate|fade|slide|zoom)-[a-z0-9-]+/g)]
            .map(match => match[0])
            .filter(name => !coreAnimations.has(name)),
    );

    for (const name of animationUtilities) {
        const supported = name.startsWith('animate-')
            ? stylesheet.includes(`--${name}:`) || stylesheet.includes(`.${name} {`)
            : stylesheet.includes(`@utility ${name} {`);
        assert.equal(supported, true, `Missing critical CSS definition for ${name}`);
    }

    const stateVariants = new Set(
        [...source.matchAll(/\bdata-(?:active|checked|closed|disabled|horizontal|open|selected|unchecked|vertical):/g)]
            .map(match => match[0].slice(0, -1)),
    );
    for (const name of stateVariants) {
        assert.match(stylesheet, new RegExp(`@custom-variant ${name}\\s`));
    }

    if (source.includes('no-scrollbar')) {
        assert.match(stylesheet, /@utility no-scrollbar\s/);
    }
});
