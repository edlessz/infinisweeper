import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-[#e4c29e] border-2 border-[#b99e81] hover:bg-[#d4b18a] active:bg-[#b99e81] transition-[background-color] duration-100",
				outline:
					"border-2 border-[#b99e81] bg-transparent hover:bg-[#e4c29e] active:bg-[#d4b18a]",
				ghost:
					"hover:bg-[#e4c29e]/50 active:bg-[#e4c29e]",
				link: "text-foreground underline-offset-4 hover:underline",
			},
			size: {
				default: "min-w-40 px-1 py-1",
				sm: "px-3 py-1 text-sm",
				lg: "px-8 py-3 text-lg",
				icon: "h-8 w-8 rounded-full border-2 border-[#b99e81] bg-[#e4c29e] hover:bg-[#d4b18a] active:bg-[#b99e81] [&_svg]:size-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

function Button({
	className,
	variant,
	size,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
