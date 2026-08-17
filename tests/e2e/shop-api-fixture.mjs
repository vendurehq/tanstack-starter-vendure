import {createServer} from 'node:http';

const activeOrderCurrencies = new Map();

const responses = {
    GetActiveChannel: {activeChannel: {
        id: 'channel-1', code: 'default', defaultLanguageCode: 'en',
        availableLanguageCodes: ['en', 'de'], defaultCurrencyCode: 'EUR', availableCurrencyCodes: ['EUR', 'USD'],
    }},
    GetActiveCustomer: {activeCustomer: null},
    GetTopCollections: {collections: {items: []}},
    SearchProducts: ({currencyCode}) => ({search: {
        totalItems: 1,
        items: [{
            productId: 'product-1', productName: 'Fixture Shoe', slug: 'fixture-shoe', productAsset: null,
            priceWithTax: {__typename: 'SinglePrice', value: currencyCode === 'USD' ? 5678 : 1234},
            // Search indexes may retain the channel currency; the request context is authoritative for display.
            currencyCode: 'EUR',
        }],
        facetValues: [],
    }}),
    GetActiveOrder: ({authorization}) => {
        const currencyCode = activeOrderCurrencies.get(authorization) ?? 'EUR';
        return {activeOrder: authorization ? {
            id: 'order-1', code: 'ORDER-1', state: 'AddingItems', totalQuantity: 1,
            subTotal: currencyCode === 'USD' ? 5678 : 1234,
            subTotalWithTax: currencyCode === 'USD' ? 5678 : 1234,
            shipping: 0, shippingWithTax: 0,
            total: currencyCode === 'USD' ? 5678 : 1234,
            totalWithTax: currencyCode === 'USD' ? 5678 : 1234,
            currencyCode, couponCodes: [], discounts: [],
            lines: [{
                id: 'line-1', unitPriceWithTax: currencyCode === 'USD' ? 5678 : 1234,
                quantity: 1, linePriceWithTax: currencyCode === 'USD' ? 5678 : 1234,
                productVariant: {
                    id: 'variant-1', name: 'Fixture Shoe', sku: 'FIXTURE-SHOE',
                    product: {id: 'product-1', name: 'Fixture Shoe', slug: 'fixture-shoe', featuredAsset: null},
                },
            }],
        } : null};
    },
    SetCurrencyCodeForOrder: ({authorization, variables}) => {
        const currencyCode = variables.currencyCode;
        activeOrderCurrencies.set(authorization, currencyCode);
        return {setCurrencyCodeForOrder: {__typename: 'Order', id: 'order-1', currencyCode}};
    },
    GetActiveOrderForCheckout: {activeOrder: null},
    GetProductDetail: ({variables}) => ({product: variables.slug === 'fixture-without-collection' ? {
        id: 'product-without-collection', name: 'Fixture Without Collection',
        description: '<p>A product that is not assigned to a collection.</p>',
        slug: 'fixture-without-collection', assets: [], collections: [], optionGroups: [],
        variants: [{
            id: 'variant-without-collection', name: 'Fixture Without Collection',
            sku: 'FIXTURE-NO-COLLECTION', priceWithTax: 1234, stockLevel: 'IN_STOCK', options: [],
        }],
    } : null}),
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
        const payload = JSON.parse(body);
        const query = payload.query ?? '';
        const operation = query.match(/\b(?:query|mutation)\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1];
        const currencyCode = new URL(request.url, 'http://127.0.0.1:3900').searchParams.get('currencyCode') ?? 'EUR';
        const fixture = responses[operation];
        const data = typeof fixture === 'function'
            ? fixture({currencyCode, authorization: request.headers.authorization, variables: payload.variables ?? {}})
            : fixture;
        response.setHeader('content-type', 'application/json');
        response.writeHead(data ? 200 : 400).end(JSON.stringify(data ? {data} : {errors: [{message: `Unknown fixture operation: ${operation}`}] }));
        return;
    }
    response.writeHead(404).end();
}).listen(3900, '127.0.0.1');
