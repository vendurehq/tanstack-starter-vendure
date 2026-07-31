import assert from 'node:assert/strict';
import test from 'node:test';
import {cachedPublicData, clearPublicCache, invalidatePublicTag} from '../../src/platform/cache/public-cache.ts';

test('public cache isolates locale and currency keys and invalidates explicit tags', async () => {
    clearPublicCache();
    let loads = 0;
    const load = () => Promise.resolve(++loads);
    const enUsd = await cachedPublicData({key: 'product:shoe:en:USD', tags: ['product-shoe-en-USD'], ttlMs: 1000, load});
    const enUsdAgain = await cachedPublicData({key: 'product:shoe:en:USD', tags: ['product-shoe-en-USD'], ttlMs: 1000, load});
    const deEur = await cachedPublicData({key: 'product:shoe:de:EUR', tags: ['product-shoe-de-EUR'], ttlMs: 1000, load});
    assert.equal(enUsd, enUsdAgain);
    assert.notEqual(enUsd, deEur);
    assert.equal(invalidatePublicTag('product-shoe-en-USD'), 1);
    assert.notEqual(await cachedPublicData({key: 'product:shoe:en:USD', tags: [], ttlMs: 1000, load}), enUsd);
});
