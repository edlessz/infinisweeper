import { createContext, useContext } from "react";
import { DbContextValue } from "./DbProvider";

export const DbContext = createContext<DbContextValue | undefined>(undefined);

export const useDb = () => useContext(DbContext);
