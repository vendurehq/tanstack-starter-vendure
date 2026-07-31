import {createServer} from 'node:http';

const responses = {
    GetActiveChannel: {activeChannel: {
        id: 'channel-1', code: 'default', defaultLanguageCode: 'en',
        availableLanguageCodes: ['en', 'de'], defaultCurrencyCode: 'EUR', availableCurrencyCodes: ['EUR', 'USD'],
    }},
    GetActiveCustomer: {activeCustomer: null},
    GetTopCollections: {collections: {items: []}},
    SearchProducts: {search: {totalItems: 0, items: [], facetValues: []}},
    GetActiveOrder: {activeOrder: null},
    GetActiveOrderForCheckout: {activeOrder: null},
    GetProductDetail: {product: null},
    GetCollectionProducts: {collection: null, search: {totalItems: 0, items: []}},
};

createServer(async (request, response) => {
    if (request.url === '/health') {
        response.writeHead(200).end('ok');
        return;
    }
    if (request.url?.startsWith('/shop-api') && request.method === 'POST') {
        let body = '';
        for await (const chunk of request) body += chunk;
        const query = JSON.parse(body).query ?? '';
        const operation = query.match(/\b(?:query|mutation)\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1];
        const data = responses[operation];
        response.setHeader('content-type', 'application/json');
        response.writeHead(data ? 200 : 400).end(JSON.stringify(data ? {data} : {errors: [{message: `Unknown fixture operation: ${operation}`}] }));
        return;
    }
    response.writeHead(404).end();
}).listen(3900, '127.0.0.1');
