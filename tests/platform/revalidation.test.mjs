import assert from 'node:assert/strict';
import test from 'node:test';
import {handleRevalidation} from '../../src/platform/revalidation/handler.ts';

function request(body, token = 'test-secret') {
    return new Request('http://localhost/api/revalidate', {
        method: 'POST',
        headers: {'content-type': 'application/json', authorization: `Bearer ${token}`},
        body: JSON.stringify(body),
    });
}

test('revalidation authenticates and expands locale-only tags', async () => {
    process.env.REVALIDATION_SECRET = 'test-secret';
    assert.equal((await handleRevalidation(request({tags: ['collections']}, 'wrong'))).status, 401);
    const response = await handleRevalidation(request({tags: ['collections']}));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(payload.results.map(result => result.tag), ['collections-en', 'collections-de']);
});

test('revalidation reports invalid input and partial success', async () => {
    process.env.REVALIDATION_SECRET = 'test-secret';
    assert.equal((await handleRevalidation(request({tags: []}))).status, 400);
    assert.equal((await handleRevalidation(request({tags: Array(101).fill('collections')}))).status, 400);
    assert.equal((await handleRevalidation(request({tags: ['collections', 'unknown']}))).status, 207);
});
