import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";
import { DrawerProvider } from "@/components/provider/drawer-provider";
import { SheetProvider } from "@/components/provider/SheetProvider";
import Toaster from "@/components/custom-ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Connection Server",
  description: "Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
      </head>

      <body
        className={`${inter.className} bg-zinc-900 h-screen w-screen text-zinc-100`}
      >
        <DrawerProvider />

        <SheetProvider />

        {children}

        <Toaster />
      </body>
    </html>
  );
}
