import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import "@uploadthing/react/styles.css";
import { DrawerProvider } from "@/components/provider/drawer-provider";

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
      <DrawerProvider />
      <body className={`${inter.className} bg-zinc-900 h-screen w-screen text-zinc-100`}>{children}</body>
      <Toaster />
    </html>
  );
}
