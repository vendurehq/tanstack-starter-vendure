import { ProductCardFragment } from "@/features/products/graphql";
import { graphql } from "@/platform/vendure/graphql";

export const GetTopCollectionsQuery = graphql(`
    query GetTopCollections {
        collections(options: { filter: { parentId: { eq: "1" } } }) {
            items {
                id
                name
                slug
            }
        }
    }
`);

export const GetCollectionProductsQuery = graphql(
	`
    query GetCollectionProducts($slug: String!, $input: SearchInput!) {
        collection(slug: $slug) {
            id
            name
            slug
            description
            featuredAsset {
                id
                preview
            }
        }
        search(input: $input) {
            totalItems
            items {
                ...ProductCard
            }
        }
    }
`,
	[ProductCardFragment],
);

export const GetCollectionPageQuery = graphql(
	`
    query GetCollectionPage($slug: String!, $input: SearchInput!) {
        collection(slug: $slug) {
            id
            name
            slug
            description
            featuredAsset {
                id
                preview
            }
        }
        search(input: $input) {
            totalItems
            items {
                ...ProductCard
            }
            facetValues {
                count
                facetValue {
                    id
                    name
                    facet {
                        id
                        name
                    }
                }
            }
        }
    }
`,
	[ProductCardFragment],
);
