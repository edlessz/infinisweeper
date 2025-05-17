import { useState } from "react";
import { ViewContext, Views } from "./useView";

interface ViewProviderProps {
  children: React.ReactNode;
  defaultView?: Views;
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
