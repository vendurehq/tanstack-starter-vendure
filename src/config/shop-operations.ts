import {
	CreateCustomerAddressMutation,
	DeleteCustomerAddressMutation,
	GetActiveCustomerQuery,
	GetCustomerAddressesQuery,
	GetCustomerOrdersQuery,
	GetOrderDetailQuery,
	RequestUpdateCustomerEmailAddressMutation,
	UpdateCustomerAddressMutation,
	UpdateCustomerEmailAddressMutation,
	UpdateCustomerMutation,
	UpdateCustomerPasswordMutation,
} from "@/features/account/graphql";
import {
	LoginMutation,
	LogoutMutation,
	RegisterCustomerAccountMutation,
	RequestPasswordResetMutation,
	ResetPasswordMutation,
	VerifyCustomerAccountMutation,
} from "@/features/authentication/graphql";
import {
	AddToCartMutation,
	AdjustCartItemMutation,
	ApplyPromotionCodeMutation,
	GetActiveOrderQuery,
	RemoveFromCartMutation,
	RemovePromotionCodeMutation,
	SetCurrencyCodeForOrderMutation,
} from "@/features/cart/graphql";
import {
	AddPaymentToOrderMutation,
	GetActiveOrderForCheckoutQuery,
	GetAvailableCountriesQuery,
	GetEligiblePaymentMethodsQuery,
	GetEligibleShippingMethodsQuery,
	SetCustomerForOrderMutation,
	SetOrderBillingAddressMutation,
	SetOrderShippingAddressMutation,
	SetOrderShippingMethodMutation,
	TransitionOrderToStateMutation,
} from "@/features/checkout/graphql";
import {
	GetCollectionPageQuery,
	GetCollectionProductsQuery,
	GetTopCollectionsQuery,
} from "@/features/collections/graphql";
import { GetOrderByCodeQuery } from "@/features/orders/graphql";
import { GetProductDetailQuery } from "@/features/products/graphql";
import { SearchProductsQuery } from "@/features/search/graphql";
import { registerShopOperations } from "@/platform/vendure/api.server";
import { GetActiveChannelQuery } from "@/platform/vendure/channel-graphql";
import { SitemapEntriesQuery } from "@/platform/seo/graphql";

// Every GraphQL operation the storefront may send to the Vendure Shop API.
// The transport rejects any request whose document does not exactly match
// one of these operations.
registerShopOperations([
	CreateCustomerAddressMutation,
	DeleteCustomerAddressMutation,
	GetActiveCustomerQuery,
	GetCustomerAddressesQuery,
	GetCustomerOrdersQuery,
	GetOrderDetailQuery,
	RequestUpdateCustomerEmailAddressMutation,
	UpdateCustomerAddressMutation,
	UpdateCustomerEmailAddressMutation,
	UpdateCustomerMutation,
	UpdateCustomerPasswordMutation,
	LoginMutation,
	LogoutMutation,
	RegisterCustomerAccountMutation,
	RequestPasswordResetMutation,
	ResetPasswordMutation,
	VerifyCustomerAccountMutation,
	AddToCartMutation,
	AdjustCartItemMutation,
	ApplyPromotionCodeMutation,
	GetActiveOrderQuery,
	RemoveFromCartMutation,
	RemovePromotionCodeMutation,
	SetCurrencyCodeForOrderMutation,
	AddPaymentToOrderMutation,
	GetActiveOrderForCheckoutQuery,
	GetAvailableCountriesQuery,
	GetEligiblePaymentMethodsQuery,
	GetEligibleShippingMethodsQuery,
	SetCustomerForOrderMutation,
	SetOrderBillingAddressMutation,
	SetOrderShippingAddressMutation,
	SetOrderShippingMethodMutation,
	TransitionOrderToStateMutation,
	GetCollectionPageQuery,
	GetCollectionProductsQuery,
	GetTopCollectionsQuery,
	GetProductDetailQuery,
	SearchProductsQuery,
	GetOrderByCodeQuery,
	GetActiveChannelQuery,
	SitemapEntriesQuery,
]);
