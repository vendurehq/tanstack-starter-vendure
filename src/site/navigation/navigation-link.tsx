import { Link } from "@/platform/tanstack/navigation";
import type { ComponentProps } from "react";

type NavigationLinkProps = ComponentProps<typeof Link>;

export function NavigationLink(props: NavigationLinkProps) {
	return <Link {...props} />;
}
