import assert from 'node:assert/strict';
import test from 'node:test';
import {getPageItems} from '../../src/features/products/components/pagination-items.ts';

test('catalog pagination keeps page controls compact while retaining the boundaries', () => {
    assert.deepEqual(getPageItems(1, 10), [1, 2, 'ellipsis', 10]);
    assert.deepEqual(getPageItems(5, 10), [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    assert.deepEqual(getPageItems(10, 10), [1, 'ellipsis', 9, 10]);
});

test('catalog pagination does not add ellipses when every page is visible', () => {
    assert.deepEqual(getPageItems(1, 1), [1]);
    assert.deepEqual(getPageItems(2, 4), [1, 2, 3, 4]);
});
