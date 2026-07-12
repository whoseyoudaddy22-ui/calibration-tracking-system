# ระบบแสดงผลและติดตามสถานะการสอบเทียบเครื่องมือ (Calibration Tracking System)

เว็บแอปพลิเคชันสำหรับจัดเก็บ ตรวจสอบ และติดตามสถานะการสอบเทียบเครื่องมือวัดในโรงงาน
แทนที่การจัดการด้วยกระดาษหรือ Excel — ดูขอบเขตโปรเจกต์แบบเต็มได้ที่ [CLAUDE.md](./CLAUDE.md)
และสถานะการพัฒนาล่าสุดที่ [PROGRESS.md](./PROGRESS.md)

## ฟีเจอร์หลัก

- แดชบอร์ดแสดงสถานะเครื่องมือแบบอัตโนมัติ: 🟢 ปกติ / 🟡 ใกล้ครบกำหนด (≤30 วัน) / 🔴 หมดอายุ
- แถบแจ้งเตือน (Alert Banner) สรุปจำนวนเครื่องมือที่ใกล้ครบกำหนด/หมดอายุ
- จัดการข้อมูลเครื่องมือ (เพิ่ม/แก้ไข/ลบ) พร้อมบันทึกประวัติการสอบเทียบอัตโนมัติ
- หน้าประวัติการสอบเทียบรายเครื่องมือ
- ระบบล็อกอินและแบ่งสิทธิ์ผู้ใช้งาน 3 ระดับ: Admin / Editor / Visitor

## Tech Stack

| ส่วนงาน | เทคโนโลยี |
|---|---|
| Front-end + Back-end | Next.js (App Router) + TypeScript |
| Database | SQLite |
| ORM | Prisma |
| UI/Styling | Tailwind CSS |
| Authentication | NextAuth.js |

## เริ่มต้นใช้งาน (Local setup)

1. ติดตั้ง dependencies
   ```bash
   npm install
   ```
2. สร้างไฟล์ `.env` จากตัวอย่าง แล้วกรอกค่าให้ครบ (ดูวิธี generate `AUTH_SECRET` ในไฟล์)
   ```bash
   cp .env.example .env
   ```
3. สร้างฐานข้อมูล SQLite และ seed ข้อมูลตัวอย่าง — สร้าง admin user และเครื่องมือตัวอย่าง 6 รายการ
   ครบทั้ง 3 สถานะ พร้อมประวัติการสอบเทียบ
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run db:seed
   ```
4. รัน dev server
   ```bash
   npm run dev
   ```
   เปิด [http://localhost:3000](http://localhost:3000) แล้วล็อกอินด้วยบัญชีที่ seed ไว้ (ดูใน `.env`)

> ต้องการเตรียมเครื่อง demo ให้ลูกค้าดู ใช้คำสั่ง `/demo-start` ใน Claude Code
> (ดู [.claude/commands/demo-start.md](./.claude/commands/demo-start.md))

## คำสั่งที่ใช้บ่อย

| งาน | คำสั่ง |
|---|---|
| รัน dev server | `npm run dev` |
| Build production | `npm run build` |
| Lint | `npm run lint` |
| เปิดดูฐานข้อมูลแบบ GUI | `npx prisma studio` |
| สร้าง migration ใหม่หลังแก้ schema | `npx prisma migrate dev --name <ชื่อ>` |
| Reseed ข้อมูลตัวอย่าง | `npm run db:seed` (idempotent — ข้ามถ้ามีข้อมูลอยู่แล้ว) |

## สถานะการ deploy

โปรเจกต์นี้ **รันแบบ local เท่านั้น** ยังไม่ deploy ขึ้นออนไลน์จนกว่าลูกค้าจะอนุมัติให้ go live

## เอกสารที่เกี่ยวข้อง

- [CLAUDE.md](./CLAUDE.md) — ขอบเขตโปรเจกต์และคำแนะนำสำหรับ Claude Code
- [PROGRESS.md](./PROGRESS.md) — สถานะการพัฒนาล่าสุด งานค้าง และ decision log
