import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AlertBanner } from "@/components/AlertBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบติดตามสถานะการสอบเทียบเครื่องมือ",
  description: "จัดเก็บ ตรวจสอบ และติดตามสถานะการสอบเทียบเครื่องมือวัด พร้อมแจ้งเตือนล่วงหน้าก่อนครบกำหนด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AlertBanner />
        {children}
      </body>
    </html>
  );
}
