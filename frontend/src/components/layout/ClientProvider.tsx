"use client";

import { useEffect } from "react";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set the client's current date as a cookie for the server to read
    // This allows Server Actions and Server Components to know the client's timezone/date context
    const date = new Date().toISOString();
    document.cookie = `client_date=${date}; path=/; max-age=86400`; // valid for 1 day
  }, []);

  return <>{children}</>;
}
