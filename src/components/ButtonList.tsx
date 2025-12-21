interface ButtonListProps {
	children: React.ReactNode;
	className?: string;
	horizontal?: boolean;
}

export const ButtonList = ({
	children,
	className = "",
	horizontal = false,
}: ButtonListProps) => {
	// first button has top border radius, last button has bottom border radius

	const rounding = `inline-flex gap-1 ${
		horizontal
			? "flex-row [&>*:first-child]:rounded-l-xl [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-r-xl [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:only-child]:rounded-xl"
			: "flex-col [&>*:first-child]:rounded-t-xl [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-b-xl [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:only-child]:rounded-xl"
	}`;

	return <div className={`${rounding} ${className}`}>{children}</div>;
};
