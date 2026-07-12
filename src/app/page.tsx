import Link from "next/link";
import { auth } from "@/auth";
import { AuthStatus } from "@/components/AuthStatus";
import { BackToTopButton } from "@/components/BackToTopButton";

const NAV_LINKS = [
  { label: "Service", href: "#service" },
  { label: "OEM Product", href: "#oem-product" },
  { label: "About Us", href: "#about" },
];

const FEATURES = [
  {
    title: "Turnkey Service",
    description:
      "ติดตามสถานะการสอบเทียบเครื่องมือแบบอัตโนมัติ พร้อมคำนวณวันหมดอายุและแสดงผลทันทีที่เข้าใช้งาน",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
  {
    title: "Advance Notification",
    description:
      "แจ้งเตือนล่วงหน้าเมื่อเครื่องมือใกล้ครบกำหนดสอบเทียบ ลดความเสี่ยงจากการใช้งานเครื่องมือที่หมดอายุ",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    ),
  },
  {
    title: "Technology",
    description:
      "บันทึกประวัติการสอบเทียบครบถ้วนทุกครั้ง สืบค้นย้อนหลังได้ง่าย พร้อมระบุผู้ดำเนินการและผลการตรวจสอบ",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-lg font-bold text-blue-950">
            Calibration Tracking
          </Link>

          <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold text-blue-950">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-blue-800">
                {link.label}
              </a>
            ))}
            <a href="#technology" className="flex items-center gap-1 hover:text-blue-800">
              Technology
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
            <a href="#contact" className="hover:text-blue-800">
              Contact Us
            </a>
          </nav>

          <AuthStatus />
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-blue-950 sm:text-4xl">
          ระบบแสดงผลและติดตามสถานะการสอบเทียบเครื่องมือ
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-700">
          จัดเก็บ ตรวจสอบ และติดตามสถานะการสอบเทียบเครื่องมือวัด พร้อมแจ้งเตือนล่วงหน้าก่อนครบกำหนด
          และประวัติการสอบเทียบที่สืบค้นได้ง่าย
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800">
            🟢 ปกติ
          </span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-800">
            🟡 ใกล้ครบกำหนด
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
            🔴 หมดอายุ
          </span>
        </div>

        <Link
          href={session?.user ? "/dashboard" : "/login"}
          className="mt-8 inline-block rounded-md bg-blue-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900"
        >
          {session?.user ? "ไปที่แดชบอร์ด" : "เข้าสู่ระบบ"}
        </Link>
      </section>

      <section className="bg-white px-6 py-16" id="service">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-14 w-14 text-blue-950"
              >
                {feature.icon}
              </svg>
              <h3 className="mt-4 text-lg font-bold text-blue-950">{feature.title}</h3>
              <div className="mt-2 h-0 w-10 border-t-2 border-dashed border-blue-950" />
              <p className="mt-3 text-sm text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative isolate flex min-h-[22rem] items-center justify-center overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          className="absolute inset-0 -z-10 h-full w-full"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="1200" height="400" fill="url(#sky)" />
          <g fill="#1e293b">
            <rect x="0" y="220" width="140" height="180" />
            <rect x="120" y="160" width="90" height="240" />
            <rect x="230" y="260" width="160" height="140" />
            <rect x="400" y="120" width="60" height="280" />
            <rect x="470" y="200" width="200" height="200" />
            <rect x="690" y="180" width="70" height="220" />
            <rect x="770" y="240" width="180" height="160" />
            <rect x="960" y="150" width="80" height="250" />
            <rect x="1050" y="220" width="150" height="180" />
          </g>
          <g fill="#0f172a">
            <rect x="150" y="100" width="16" height="80" />
            <rect x="500" y="90" width="16" height="120" />
            <rect x="1000" y="80" width="16" height="90" />
          </g>
          <g stroke="#f1f5f9" strokeOpacity="0.25" strokeWidth="2">
            <path d="M470 220h200M470 260h200M470 300h200M470 340h200" />
            <path d="M770 260h180M770 300h180M770 340h180" />
          </g>
        </svg>

        <div className="absolute inset-0 -z-10 bg-blue-900/70" />

        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            พร้อมยกระดับการจัดการสอบเทียบเครื่องมือของคุณ
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            ลดความล่าช้า ลดข้อมูลตกหล่น และไม่พลาดวันครบกำหนดสอบเทียบอีกต่อไป
          </p>
        </div>

        <BackToTopButton />
      </section>
    </div>
  );
}
