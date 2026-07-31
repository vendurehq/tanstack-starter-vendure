import assert from 'node:assert/strict';
import test from 'node:test';
import {safeInternalRedirect} from '../../src/platform/tanstack/redirect.ts';
import {catalogSearchSchema, redirectSearchSchema, tokenSearchSchema} from '../../src/platform/tanstack/search.ts';

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
    assert.equal(redirectSearchSchema.parse({redirectTo: '/account'}).redirectTo, '/account');
    assert.equal(redirectSearchSchema.parse({redirectTo: '//evil.example'}).redirectTo, undefined);
    assert.equal(tokenSearchSchema.parse({token: 'abc'}).token, 'abc');
    assert.equal(tokenSearchSchema.parse({redirectTo: '//evil.example'}).redirectTo, undefined);
});
