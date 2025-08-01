"use client";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import NextAuthSessionProvider from "../components/SessionProvider";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="es">
      <head>
        <title>HCD Las Flores - Intranet</title>
      </head>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
