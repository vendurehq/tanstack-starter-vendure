import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import {safeInternalRedirect} from '../../src/platform/tanstack/redirect.ts';
import {catalogSearchSchema, productSearchSchema, redirectSearchSchema, tokenSearchSchema} from '../../src/platform/tanstack/search.ts';

async function loadNavigationAdapter(navigate) {
	const source = await readFile(
		path.join(import.meta.dirname, '../../src/platform/tanstack/navigation.tsx'),
		'utf8',
	);
	const output = ts.transpileModule(source, {
		compilerOptions: {
			jsx: ts.JsxEmit.ReactJSX,
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
		},
	}).outputText;
	const module = {exports: {}};
	vm.runInNewContext(output, {
		exports: module.exports,
		module,
		require(specifier) {
			if (specifier === '@tanstack/react-router') {
				return {
					Link: () => null,
					useNavigate: () => navigate,
					useRouter: () => ({invalidate: () => undefined}),
					useRouterState: () => undefined,
				};
			}
			if (specifier === 'react') return {useMemo: (callback) => callback()};
			if (specifier === 'react/jsx-runtime') return {jsx: () => null};
			throw new Error(`Unexpected import: ${specifier}`);
		},
	});
	return module.exports.useRouter();
}

test('safe redirects allow only local paths', () => {
    assert.equal(safeInternalRedirect('/checkout?step=payment'), '/checkout?step=payment');
    assert.equal(safeInternalRedirect('//evil.example'), '/');
    assert.equal(safeInternalRedirect('https://evil.example'), '/');
    assert.equal(safeInternalRedirect(undefined, '/en'), '/en');
});

test('route search schemas coerce pagination and preserve repeatable facets', () => {
    assert.deepEqual(catalogSearchSchema.parse({q: 'shoe', page: '2', sort: 'price-asc', facets: ['red', 'large']}), {
        q: 'shoe', page: 2, sort: 'price-asc', facets: ['red', 'large'],
    });
    assert.equal(catalogSearchSchema.parse({page: '-4'}).page, 1);
	assert.deepEqual(catalogSearchSchema.parse({q: '  shoe  ', sort: 'invalid', facets: ['red', 'red', '']}), {
		q: 'shoe', page: 1, sort: 'name-asc', facets: ['red'],
	});
    assert.equal(redirectSearchSchema.parse({redirectTo: '/account'}).redirectTo, '/account');
    assert.equal(redirectSearchSchema.parse({redirectTo: '//evil.example'}).redirectTo, undefined);
    assert.equal(tokenSearchSchema.parse({token: 'abc'}).token, 'abc');
    assert.equal(tokenSearchSchema.parse({redirectTo: '//evil.example'}).redirectTo, undefined);
	assert.deepEqual(productSearchSchema.parse({size: 42, color: 'blue'}), {
		size: '42',
		color: 'blue',
	});
});

test('router push preserves scroll when requested', async () => {
	const navigations = [];
	const router = await loadNavigationAdapter((options) => navigations.push(options));

	router.push('/en/product/laptop?laptop-ram=16gb', {scroll: false});

	assert.equal(navigations.length, 1);
	assert.equal(navigations[0].href, '/en/product/laptop?laptop-ram=16gb');
	assert.equal(navigations[0].resetScroll, false);
});

test('router push keeps TanStack default scrolling for normal navigation', async () => {
	const navigations = [];
	const router = await loadNavigationAdapter((options) => navigations.push(options));

	router.push('/en/search?q=laptop');

	assert.equal(navigations.length, 1);
	assert.equal(navigations[0].href, '/en/search?q=laptop');
	assert.equal(navigations[0].resetScroll, undefined);
});
