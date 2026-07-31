import type { CSSProperties, ImgHTMLAttributes } from "react";

type StorefrontImageProps = Omit<
	ImgHTMLAttributes<HTMLImageElement>,
	"width" | "height"
> & {
	width?: number | string;
	height?: number | string;
	fill?: boolean;
	priority?: boolean;
};

export default function StorefrontImage({
	fill,
	priority,
	style,
	alt,
	...props
}: StorefrontImageProps) {
	const fillStyle: CSSProperties | undefined = fill
		? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
		: style;

	return (
		<img
			{...props}
			alt={alt ?? ""}
			loading={priority ? "eager" : (props.loading ?? "lazy")}
			fetchPriority={priority ? "high" : props.fetchPriority}
			style={fillStyle}
		/>
	);
}
