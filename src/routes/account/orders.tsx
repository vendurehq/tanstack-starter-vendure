import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/account/orders")({
	component: Outlet,
});
