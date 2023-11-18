import React, { Dispatch, SetStateAction } from "react";

export const PersonaContext = React.createContext<
  [string, Dispatch<SetStateAction<string>>] | null
>(null);

export function PersonaContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [persona, setPersona] = React.useState<string>("");
  return (
    <PersonaContext.Provider value={[persona, setPersona]}>
      {children}
    </PersonaContext.Provider>
  );
}
