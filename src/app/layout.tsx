import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PinShop - Арзан & Сапаттуу",
  description: "Pinduoduo стилиндеги онлайн дүкөн - видео коммерция, групповой покупка",
  keywords: "онлайн дүкөн, видео коммерция, арзан товар, групповой покупка",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ky">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--pdd-gray)]`}
      >
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}