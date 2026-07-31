import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {executeVendureRequest} from '../../src/platform/vendure/api.server.ts';

const channelQuery = 'query GetActiveChannel { activeChannel { id } }';

test('Vendure transport reads request-time configuration and sends channel/language/currency headers', async () => {
    process.env.VENDURE_SHOP_API_URL = 'https://shop.example.test/shop-api';
    process.env.VENDURE_CHANNEL_TOKEN = 'channel-token';
    const originalFetch = globalThis.fetch;
    let captured;
    globalThis.fetch = async (url, init) => {
        captured = {url: String(url), init};
        return Response.json({data: {activeChannel: {id: '1'}}}, {headers: {'vendure-auth-token': 'next-token'}});
    };
    try {
        const result = await executeVendureRequest({
            query: channelQuery,
            variables: {},
            options: {languageCode: 'de', currencyCode: 'EUR'},
        });
        assert.equal(result.token, 'next-token');
        assert.equal(captured.init.headers['vendure-token'], 'channel-token');
        assert.match(captured.url, /languageCode=de/);
        assert.match(captured.url, /currencyCode=EUR/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('Vendure transport rejects missing configuration, GraphQL errors, and unknown operations', async () => {
    const originalUrl = process.env.VENDURE_SHOP_API_URL;
    delete process.env.VENDURE_SHOP_API_URL;
    await assert.rejects(() => executeVendureRequest({query: channelQuery, variables: {}}), /VENDURE_SHOP_API_URL/);
    process.env.VENDURE_SHOP_API_URL = 'https://shop.example.test/shop-api';
    await assert.rejects(
        () => executeVendureRequest({query: 'query ArbitraryOperation { activeChannel { id } }', variables: {}}),
        /not allowed/,
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => Response.json({errors: [{message: 'Shop API failure'}]});
    try {
        await assert.rejects(() => executeVendureRequest({query: channelQuery, variables: {}}), /Shop API failure/);
    } finally {
        globalThis.fetch = originalFetch;
        if (originalUrl === undefined) delete process.env.VENDURE_SHOP_API_URL;
        else process.env.VENDURE_SHOP_API_URL = originalUrl;
    }
});

test('authentication and currency cookies retain required security attributes', async () => {
    const authSource = await readFile(new URL('../../src/platform/vendure/auth-token.server.ts', import.meta.url), 'utf8');
    const currencySource = await readFile(new URL('../../src/features/currency/currency.server.ts', import.meta.url), 'utf8');
    assert.match(authSource, /httpOnly:\s*true/);
    assert.match(authSource, /sameSite:\s*'lax'/);
    assert.match(authSource, /path:\s*'\/'/);
    assert.match(authSource, /secure:\s*process\.env\.NODE_ENV === 'production'/);
    assert.match(currencySource, /maxAge:\s*60 \* 60 \* 24 \* 365/);
});
