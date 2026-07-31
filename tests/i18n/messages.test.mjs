import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..', '..');

async function findMessageFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await findMessageFiles(file)));
        } else if (entry.name.endsWith('.json') && path.basename(directory) === 'messages') {
            files.push(path.relative(root, file));
        }
    }
    return files;
}

async function findTypeScriptFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await findTypeScriptFiles(file));
        if (entry.isFile() && /\.tsx?$/.test(entry.name)) files.push(file);
    }
    return files;
}

test('every message file is covered by the Paraglide project configuration', async () => {
    const discovered = (await findMessageFiles(path.join(root, 'src'))).sort();
    const settings = JSON.parse(await readFile(path.join(root, 'project.inlang/settings.json'), 'utf8'));
    const patterns = settings['plugin.inlang.icu-messageformat-1']?.pathPattern ?? [];
    assert.ok(patterns.some(pattern => pattern.includes('features')), 'Paraglide must load feature catalogs.');
    assert.ok(patterns.some(pattern => pattern.includes('site')), 'Paraglide must load site catalogs.');
    assert.ok(patterns.some(pattern => pattern.includes('platform')), 'Paraglide must load shared platform catalogs.');
    assert.ok(discovered.length > 0, 'At least one source catalog must exist.');
});

function messageKeys(value, prefix = '') {
    return Object.entries(value).flatMap(([key, child]) => {
        const qualified = prefix ? `${prefix}.${key}` : key;
        return child && typeof child === 'object' && !Array.isArray(child)
            ? messageKeys(child, qualified)
            : [qualified];
    });
}

test('message keys match across locales', async () => {
    const discovered = await findMessageFiles(path.join(root, 'src'));
    const englishFiles = discovered.filter(file => path.basename(file) === 'en.json');
    for (const englishFile of englishFiles) {
        const germanFile = path.join(path.dirname(englishFile), 'de.json');
        assert.ok(discovered.includes(germanFile), `${englishFile} has no matching de.json file.`);
        const english = JSON.parse(await readFile(path.join(root, englishFile), 'utf8'));
        const german = JSON.parse(await readFile(path.join(root, germanFile), 'utf8'));
        assert.deepEqual(
            messageKeys(german).sort(),
            messageKeys(english).sort(),
            `${englishFile} and ${germanFile} must define the same message keys.`,
        );
    }
});

test('message namespaces are unique per locale', async () => {
    const owners = new Map();
    for (const file of await findMessageFiles(path.join(root, 'src'))) {
        const locale = path.basename(file, '.json');
        const messages = JSON.parse(await readFile(path.join(root, file), 'utf8'));
        for (const namespace of Object.keys(messages)) {
            const key = `${locale}:${namespace}`;
            assert.ok(
                !owners.has(key),
                `Namespace "${namespace}" for locale "${locale}" is defined in both ${owners.get(key)} and ${file}.`,
            );
            owners.set(key, file);
        }
    }
});

test('features use only owned or shared message namespaces', async () => {
    const owners = new Map();
    for (const file of (await findMessageFiles(path.join(root, 'src'))).filter(candidate => path.basename(candidate) === 'en.json')) {
        const messages = JSON.parse(await readFile(path.join(root, file), 'utf8'));
        const feature = file.match(/^src[/\\]features[/\\]([^/\\]+)[/\\]/)?.[1];
        const owner = feature ?? (file.startsWith(`src${path.sep}platform${path.sep}i18n${path.sep}`) ? 'platform.i18n' : 'site');
        for (const messageId of Object.keys(messages)) owners.set(messageId.split('_')[0], owner);
    }

    const violations = [];
    const featuresRoot = path.join(root, 'src', 'features');
    for (const file of await findTypeScriptFiles(featuresRoot)) {
        const feature = path.relative(featuresRoot, file).split(path.sep)[0];
        const content = await readFile(file, 'utf8');
        const namespaces = [
            ...content.matchAll(/(?:useTranslations|getTranslations)\(\s*['"]([^'"]+)['"]/g),
            ...content.matchAll(/namespace:\s*['"]([^'"]+)['"]/g),
        ].map(match => match[1]);
        for (const namespace of namespaces) {
            const owner = owners.get(namespace);
            if (owner !== feature && owner !== 'platform.i18n') {
                violations.push(`${path.relative(root, file)} uses ${namespace} owned by ${owner ?? 'nobody'}`);
            }
        }
    }
    assert.deepEqual(violations, []);
});
