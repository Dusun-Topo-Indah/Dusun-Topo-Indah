"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface BreadcrumbContextType {
  overrideLabel: string | null;
  setOverrideLabel: (label: string | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  overrideLabel: null,
  setOverrideLabel: () => {},
});

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [overrideLabel, setOverrideLabel] = useState<string | null>(null);

  return (
    <BreadcrumbContext.Provider value={{ overrideLabel, setOverrideLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}

export function SetBreadcrumb({ label }: { label: string }) {
  const { setOverrideLabel } = useBreadcrumb();

  useEffect(() => {
    setOverrideLabel(label);
    return () => setOverrideLabel(null);
  }, [label, setOverrideLabel]);

  return null;
}
