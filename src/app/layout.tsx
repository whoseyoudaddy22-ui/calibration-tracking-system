import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { AlertBanner } from "@/components/AlertBanner";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-thai-sans",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบติดตามสถานะการสอบเทียบเครื่องมือ",
  description: "จัดเก็บ ตรวจสอบ และติดตามสถานะการสอบเทียบเครื่องมือวัด พร้อมแจ้งเตือนล่วงหน้าก่อนครบกำหนด",
  icons: {
    icon: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AlertBanner />
        {children}
      </body>
    </html>
  );
}
