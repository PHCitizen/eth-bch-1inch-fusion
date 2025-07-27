"use client";

import Link from "next/link";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark">
        <QueryClientProvider client={queryClient}>
          <nav className="flex gap-2 p-2">
            <Link href="/">
              <Button>Swap</Button>
            </Link>
            <Link href="/orders">
              <Button>Orders</Button>
            </Link>
          </nav>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
