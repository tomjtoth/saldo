import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import StoreProvider from "./StoreProvider";
import UserAvatar from "@/components/user-avatar";
import Sidepanel from "@/components/sidepanel";
import Canceler from "@/components/canceler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saldo",
  description: "A multi-user expense tracker app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <Canceler />
          <Sidepanel />
          <UserAvatar />
        </StoreProvider>
        <div className="p-2">{children}</div>
      </body>
    </html>
  );
}
