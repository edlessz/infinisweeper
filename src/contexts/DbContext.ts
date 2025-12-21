import { createContext, use } from "react";
import type { DbContextValue } from "./DbProvider";

export const DbContext = createContext<DbContextValue | undefined>(undefined);

export const useDb = (): DbContextValue => {
	const context = use(DbContext);
	if (!context) throw new Error("useDb must be used within a DbProvider");
	return context;
};
