import { graphql } from "@/platform/vendure/graphql";

export const SitemapEntriesQuery = graphql(`
    query SitemapEntries($skip: Int!, $take: Int!) {
        collections(options: { skip: $skip, take: $take }) {
            totalItems
            items {
                id
                slug
                updatedAt
                parent {
                    id
                }
            }
        }
        search(input: { skip: $skip, take: $take, groupByProduct: true }) {
            totalItems
            items {
                productId
                slug
            }
        }
    }
`);
