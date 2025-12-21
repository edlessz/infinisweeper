import { useState } from "react";
import { ViewContext, Views } from "./ViewContext";

interface ViewProviderProps {
	children: React.ReactNode;
	defaultView?: Views;
}
export interface ViewContextValue {
	view: Views;
	setView: (view: Views) => void;
}

export const ViewProvider = ({
	children,
	defaultView = Views.MENU,
}: ViewProviderProps) => {
	const [view, setView] = useState<Views>(defaultView);

	return (
		<ViewContext.Provider value={{ view, setView }}>
			{children}
		</ViewContext.Provider>
	);
};
