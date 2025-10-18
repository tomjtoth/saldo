import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";

import "./globals.css";
import StoreProvider from "../components/storeProvider";
import { ModalProvider } from "@/components/modal";

/* istanbul ignore next */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* istanbul ignore next */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saldo",
  description: "A multi-user expense tracker app",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ToastContainer autoClose={2000} closeOnClick />
        <StoreProvider>
          <ModalProvider>{children}</ModalProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
