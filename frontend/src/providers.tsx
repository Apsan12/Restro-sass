"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import AuthInitializer from "@/components/auth-initializer";
export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,// this is called stale time means 30 sec lai data hold garxa 
            refetchOnWindowFocus: false,
          },
        },
      })
  );

 return (
  <QueryClientProvider client={queryClient}>
    <AuthInitializer />
    {children}
  </QueryClientProvider>
);
}