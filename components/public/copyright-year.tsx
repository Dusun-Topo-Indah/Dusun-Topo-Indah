"use client";

import { Suspense } from "react";

function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}

export function CopyrightYear() {
  return (
    <Suspense fallback={<span suppressHydrationWarning>2024</span>}>
      <CurrentYear />
    </Suspense>
  );
}
