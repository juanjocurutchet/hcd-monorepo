import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
