import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";

import { VDate } from "@/app/_lib/utils";

import "./globals.css";
import StoreProvider from "./_components/storeProvider";
import { BodyNodeProvider } from "@/app/_components/bodyNodes";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SALDO_DATETIME_ANCHOR__ = ${VDate.anchor};`,
          }}
        />
        <ToastContainer autoClose={2000} closeOnClick />
        <StoreProvider>
          <BodyNodeProvider>{children}</BodyNodeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
