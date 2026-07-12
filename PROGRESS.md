# สถานะการพัฒนาโปรเจกต์

ไฟล์นี้บันทึกความคืบหน้าล่าสุดของโปรเจกต์ สำหรับให้ Claude Code (หรือคนอื่นที่เข้ามาทำงานต่อ)
อ่านก่อนเริ่มงาน จะได้เข้าใจว่าอะไรเสร็จแล้ว อะไรยังค้าง และทำไมถึงตัดสินใจแบบนั้น

**Claude Code: เมื่อทำงานสำคัญเสร็จ (ฟีเจอร์ใหม่, แก้บั๊ก, ตัดสินใจสำคัญ) ให้อัปเดตไฟล์นี้ก่อนจบงาน
โดยเฉพาะก่อน commit — เพิ่มรายการใหม่ ไม่ต้องเขียนใหม่ทั้งหมด**

_อัปเดตล่าสุด: 2026-07-12_

## เสร็จแล้ว (Completed)

- **Auth + RBAC**: ล็อกอินด้วย NextAuth.js (credentials provider), แบ่งสิทธิ์ Admin/Editor/Visitor
  บังคับสิทธิ์ทั้งใน middleware (`src/proxy.ts`) และในแต่ละ server action (`requireRole` ใน `src/lib/authz.ts`)
- **Dashboard**: แสดงรายการเครื่องมือทั้งหมด พร้อมคำนวณสถานะอัตโนมัติ 🟢/🟡/🔴 (`src/lib/status.ts`)
- **Tool CRUD**: เพิ่ม/แก้ไข/ลบเครื่องมือ พร้อมบันทึกประวัติการสอบเทียบอัตโนมัติเมื่อสร้างหรือแก้ไขวันที่สอบเทียบ
- **Calibration History View**: หน้าดูรายละเอียดเครื่องมือแต่ละชิ้นพร้อมประวัติทั้งหมด
- **Alert Banner**: แถบแจ้งเตือนแบบ global สรุปจำนวนเครื่องมือใกล้ครบกำหนด/หมดอายุ ขยาย/ปิดได้
- **Admin user management**: เพิ่ม/แก้ไขสิทธิ์/ลบผู้ใช้ พร้อมกันไม่ให้ลบ/ถอดสิทธิ์ตัวเอง
- **Landing page**: หน้าแรกที่ปรับตามสถานะล็อกอิน (ยังไม่ล็อกอิน → ปุ่มเข้าสู่ระบบ, ล็อกอินแล้ว → ปุ่มไปแดชบอร์ด)
- **Branding**: โลโก้ TKC เป็น favicon และแสดงอยู่เหนือฟอร์ม login
- **`.env.example`**: template สำหรับ env vars ที่จำเป็น (commit ได้ ต่างจาก `.env` จริงที่ถูก gitignore)
- **Sample seed data**: `prisma/seed.ts` สร้างเครื่องมือตัวอย่าง 6 รายการ ครบทั้ง 3 สถานะ พร้อมประวัติ
  การสอบเทียบ 2 รอบต่อชิ้น, seed แบบ idempotent (รันซ้ำได้ไม่ซ้ำข้อมูล)
- **Project tooling**: `.claude/skills/` (ui-design-system, review-code, environment-setup) และ
  `/demo-start` command สำหรับเตรียมเครื่อง demo ให้ลูกค้าดูแบบ local-only
- **RBAC end-to-end verification**: ทดสอบจริงในเบราว์เซอร์ทั้ง 3 สิทธิ์แล้ว — Editor เห็นเมนู
  "จัดการเครื่องมือ" แต่ไม่เห็น/เข้า `/admin` ไม่ได้ (redirect), สร้าง/แก้ไข/ลบเครื่องมือได้จริง;
  Visitor เห็นแค่แดชบอร์ด เข้า `/tools/manage` และ `/admin` ไม่ได้ (redirect ทั้งคู่) แต่ดูหน้าประวัติ
  เครื่องมือ (read-only) ได้ปกติ — middleware และ server action บังคับสิทธิ์ตรงกันทุกกรณี ไม่พบบั๊ก
- **Pagination + search**: เพิ่มช่องค้นหา (รหัส/ชื่อ/แผนก) และแบ่งหน้า 20 รายการ/หน้า ทั้งใน `/dashboard`
  และ `/tools/manage` ผ่าน URL search params (`?q=&page=`), ใช้ native GET form ไม่มี client JS
  (`ToolSearchForm`, `Pagination` components ที่ `src/components/`) ทดสอบจริงกับข้อมูล 26 รายการ
  แบ่งเป็น 2 หน้าถูกต้อง, ค้นหากรองถูกต้อง, ปุ่มก่อนหน้า/ถัดไป disable ที่ขอบถูกต้อง
- **Automated tests (Vitest)**: ติดตั้ง Vitest + `npm run test` (`vitest.config.ts` ตั้ง alias `@/*`
  ให้ตรงกับ tsconfig) เขียน unit test 21 เคสครอบคลุม:
  - `src/lib/status.test.ts` — `getToolStatus` ทุก boundary (ก่อน/ที่/หลังเส้น 30 วัน, หมดอายุ)
  - `src/lib/authz.test.ts` — `requireRole` ทุก branch (role ผ่าน/ไม่ผ่าน/ไม่มี session/ไม่มี user)
  - `src/lib/routeAccess.test.ts` — logic การ redirect ของ middleware ทุก role × ทุก route ที่ป้องกัน
  แยก `decideRedirect` ออกจาก `src/proxy.ts` ไปเป็น `src/lib/routeAccess.ts` (pure function ไม่พึ่ง
  `next/server`/`next-auth`) เพื่อให้ทดสอบได้โดยไม่ต้อง mock request จริง — พฤติกรรม middleware เดิม
  ไม่เปลี่ยน ตรวจสอบซ้ำในเบราว์เซอร์แล้วว่า auth redirect ยังทำงานถูกต้องเหมือนเดิม
- **Integration tests (server actions, SQLite test DB จริง)**: เพิ่ม 20 เคสใหม่ ทำงานกับฐานข้อมูล
  SQLite จริงแยกต่างหาก (`test-integration.db`, gitignored) ไม่ใช่ mock:
  - `src/app/tools/manage/actions.integration.test.ts` — `createTool`/`updateTool`/`deleteTool` ครบ
    ทุกกรณี (สร้างพร้อมประวัติแรก, แก้ไขแล้วเพิ่มประวัติเมื่อวันที่สอบเทียบเปลี่ยน, ไม่เพิ่มประวัติเมื่อ
    ไม่เปลี่ยน, ลบพร้อมประวัติ, ปฏิเสธ Visitor, field ขาด/วันที่ผิดรูปแบบ, tool ไม่มีอยู่จริง)
  - `src/app/admin/actions.integration.test.ts` — `createUser`/`updateUserRole`/`deleteUser` ครบ
    ทุกกรณี (hash รหัสผ่านจริงด้วย bcrypt, ปฏิเสธ role ที่ไม่ใช่ Admin, กันลบ/ถอดสิทธิ์ Admin ตัวเอง,
    รหัสผ่านสั้นเกินไป, role ไม่ถูกต้อง)
  - Setup อยู่ที่ `src/test/` (`globalSetup.ts` รัน `prisma migrate deploy` ใส่ไฟล์ db ทดสอบก่อนรันเทส
    ทั้งหมดแล้วลบทิ้งหลังจบ, `setupEnv.ts` ตั้ง `DATABASE_URL`/`AUTH_SECRET` ให้ทุกไฟล์เทสก่อน import
    `@/lib/prisma`, `testDbPath.ts` เป็น path ร่วมกัน) — mock เฉพาะ `@/auth` (คุม session) กับ
    `next/cache` (revalidatePath ใช้นอก request scope ไม่ได้) เท่านั้น ส่วน DB query จริงทั้งหมด
  - `vitest.config.ts` เพิ่ม `fileParallelism: false` เพราะทุกไฟล์เทสใช้ sqlite file เดียวกันผ่าน
    better-sqlite3 (synchronous, lock ได้ถ้ารันพร้อมกัน) — รันตามลำดับแทน เร็วพอสำหรับขนาดโปรเจกต์นี้
  - **ไม่ครอบคลุม** `loginAction` (`src/app/login/actions.ts`) — ตัวมันเองเรียก NextAuth `signIn`
    ซึ่งต้องใช้ cookies/request scope ของจริงที่ Next.js server เท่านั้น (ทดสอบใน Node ตรงๆ ไม่ได้อย่างมีความหมาย)
    ตรรกะหลักที่แตะ DB จริง (`authorize` callback ใน `src/auth.ts`) ยังไม่มีเทสแยก — ถ้าต้องการความมั่นใจ
    เพิ่มเติมสำหรับ login ควรทำ e2e/browser test แทน

## ช่องโหว่ / สิ่งที่ยังไม่สมบูรณ์ (Known gaps)

- ไม่มีระบบ self-service reset password — ต้องให้ Admin จัดการผ่านหน้า `/admin` เท่านั้น
- Alert Banner dismiss ใช้ `sessionStorage` แยกตามวันต่อแท็บเบราว์เซอร์ — ถ้ากดปิดระหว่างซ้อม demo
  จะไม่กลับมาอีกในแท็บนั้นจนกว่าจะข้ามวัน (ไม่ใช่บั๊ก แต่ต้องระวังตอน demo จริง)
- ยังไม่มีแผน production database — SQLite เหมาะกับ local/demo แต่ต้องประเมินใหม่ก่อน go-live จริง
  ถ้ามีผู้ใช้พร้อมกันเยอะ

## แผนงานถัดไป (Next steps)

- คุยกับลูกค้าเรื่องแผน hosting/deploy ก่อน go-live (ตอนนี้ยัง local-only ตามนโยบายโปรเจกต์)
- พิจารณาเพิ่ม e2e/browser test สำหรับ `loginAction` ถ้าต้องการความมั่นใจสูงขึ้นกว่าปัจจุบัน (ดูหมายเหตุ
  ในหัวข้อ Integration tests ด้านบน)

## บันทึกการตัดสินใจสำคัญ (Decision log)

- **2026-07-12** — คำสั่งติดตั้ง Node.js ใน `/demo-start` ใช้ `winget install OpenJS.NodeJS.LTS`
  แทนการดาวน์โหลด installer เองจากเว็บ เพราะ winget เป็นแหล่งที่เชื่อถือได้และเครื่องลูกค้าอาจมี
  นโยบายความปลอดภัยสูง ต้องขอยืนยันจากผู้ใช้ก่อนติดตั้งทุกครั้ง (ไม่ auto-install)
- **2026-07-12** — ปรับ `prisma/seed.ts` ให้การสร้าง admin user กับการ seed เครื่องมือตัวอย่างเป็นคนละ
  ขั้นตอนที่ idempotent แยกกัน (ของเดิม `return` ทันทีถ้ามี admin อยู่แล้ว ทำให้ seed เครื่องมือไม่ทำงานเลยถ้ารันซ้ำ)
- **2026-07-12** — Favicon ใช้ `metadata.icons` ชี้ไปที่ `public/logo.webp` แทนการใช้ Next.js file-convention
  icon เพราะไฟล์เป็น `.webp` ซึ่ง convention ไม่รองรับแน่นอน และลบ `src/app/favicon.ico` เดิมทิ้ง
  เพราะมันจะ override favicon ที่ตั้งใจใช้
- **2026-07-12** — ลบโฟลเดอร์ `logo/` เดิมที่ root หลังย้ายไฟล์เข้า `public/logo.webp` แล้ว — การลบนี้ไม่ได้
  ถูกขอโดยตรงและถูกระบบ permission ดักไว้ ผู้ใช้ตรวจสอบแล้วอนุมัติให้ปล่อยตามนั้น (เนื้อหาไฟล์ปลอดภัย
  อยู่ใน `public/logo.webp` แล้ว)
- **โครงการทั้งหมด** — จะยังรันแบบ local-only เท่านั้น จะไม่ deploy ขึ้นออนไลน์จนกว่าลูกค้าจะอนุมัติ go-live
  (ระบุไว้ใน `.claude/commands/demo-start.md` ด้วย)
