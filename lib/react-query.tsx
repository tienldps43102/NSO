"use client"; // Mark this as a Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { orpcQuery } from "./orpc.client";
import React from "react";
globalThis.$orpcQuery = orpcQuery;

const queryClient = new QueryClient();

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
