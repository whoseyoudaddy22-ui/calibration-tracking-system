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
- **Landing page redesign (TKC Progress reference)**: ปรับ UI หน้าแรก (`src/app/page.tsx`) ตาม reference
  design ที่ลูกค้าให้มา — top nav พื้นขาวมีเส้นขอบล่าง/shadow พร้อมลิงก์สไตล์บริษัท (Service, OEM Product,
  About Us, Technology ▾, Contact Us สีกรมท่า `text-blue-950` ตัวหนา), section 3 คอลัมน์ฟีเจอร์
  (ไอคอน outline + หัวข้อ + เส้นคั่นประ + คำอธิบาย, responsive `grid-cols-1 md:grid-cols-3`), และ banner
  ท้ายหน้าเป็นภาพ skyline โรงงานที่วาดด้วย SVG inline (ไม่ใช้รูปจริง เพื่อไม่ต้อง fetch ไฟล์ภายนอก) ทับด้วย
  `bg-blue-900/70` overlay ให้อ่านตัวอักษรขาวได้ชัด พร้อมปุ่ม "กลับขึ้นด้านบน" ทรงกลมมุมล่างขวา
  (`src/components/BackToTopButton.tsx`, client component ใช้ `window.scrollTo`) — เก็บ CTA
  เข้าสู่ระบบ/ไปแดชบอร์ดและ badge สถานะ 🟢🟡🔴 เดิมไว้ใน hero section ไม่ได้ตัดออก
  ทดสอบจริงในเบราว์เซอร์ทั้ง mobile และ desktop (1280px) แล้วว่า layout/สี/ปุ่มกลับขึ้นบนทำงานถูกต้อง
  ไม่มี console error และตรวจซ้ำว่าไม่กระทบหน้าอื่น (`/login`, `/dashboard`, `/tools/manage`, `/tools/[id]`,
  `/admin`) — ทำงานผ่าน branch `feature/landing-page-redesign` → PR → merge เข้า `master`
  (commit `b9bdba3`) แล้วลบ branch ทิ้งหลัง merge
  - ตรวจซ้ำอีกครั้งหลัง push `708fe26` (อัปเดต PROGRESS.md) — dev server รันปกติ (`GET / 200`, ไม่มี error
    ใน log), เนื้อหาหน้า/console ปกติทุกอย่าง (session admin ยังอยู่จาก session ก่อนหน้า) เครื่องมือ
    screenshot ของ Browser pane เกิด timeout ชั่วคราวในรอบนี้แต่ไม่กระทบตัวแอป — ยืนยันด้วย
    `get_page_text`/console แทน
  - **ยังไม่ deploy ขึ้น live URL** — โปรเจกต์นี้ยัง local-only ตามนโยบาย (ดู "ช่องโหว่/แผนงานถัดไป" ด้านล่าง)
    การ "เช็คไซต์" ทุกครั้งคือรัน dev server ในเครื่องแล้วเปิดผ่าน Browser pane เท่านั้น ไม่มี URL สาธารณะ
- **Branding**: โลโก้ TKC เป็น favicon และแสดงอยู่เหนือฟอร์ม login
- **`.env.example`**: template สำหรับ env vars ที่จำเป็น (commit ได้ ต่างจาก `.env` จริงที่ถูก gitignore)
- **Sample seed data**: `prisma/seed.ts` สร้างเครื่องมือตัวอย่าง 6 รายการ ครบทั้ง 3 สถานะ พร้อมประวัติ
  การสอบเทียบ 2 รอบต่อชิ้น, seed แบบ idempotent (รันซ้ำได้ไม่ซ้ำข้อมูล)
- **Demo user accounts (Editor/Visitor)**: เพิ่ม `ensureDemoUsers()` ใน `prisma/seed.ts` สร้างบัญชี
  `editor`/`visitor` (รหัสผ่านเดียวกับ admin คือ `SEED_ADMIN_PASSWORD`) — รันแล้วจริงใน `dev.db`
  ตอนนี้มีครบ 3 role (`admin`/`editor`/`visitor`) ลูกค้ายืนยันว่าเป็นโปรเจกต์จบการศึกษาที่ส่งแล้วไม่พัฒนา
  ต่อ จึงใช้รหัสผ่านเดียวกันแบบง่ายๆ ได้โดยไม่ต้องแยก ไม่ได้แตะบัญชี admin เดิม (commit `49ccee8`,
  ตรวจสอบใน Actions tab จริงแล้วว่า CI run #4 "completed successfully")
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
    ครอบคลุมด้วย e2e/browser test แทนแล้ว (ดูหัวข้อถัดไป)
- **E2E test สำหรับ login (Playwright)**: เพิ่ม `@playwright/test` เป็น devDependency (ติดตั้ง Chromium
  browser ด้วย `npx playwright install chromium`) — ผู้ใช้เลือกแนวทางนี้เองแทนการ verify มือครั้งเดียว
  เพราะต้องการเทสอัตโนมัติที่รันซ้ำได้ในโค้ดเบส `npm run test:e2e` รัน 3 เคสใน
  `e2e/login.spec.ts` ผ่านเบราว์เซอร์จริง (headless Chromium) กับ Next dev server จริงที่พอร์ต 3100:
  - ล็อกอินด้วย credential ที่ถูกต้อง → redirect ไป `/`, เห็นชื่อผู้ใช้+role ใน `AuthStatus`, กดไปแดชบอร์ดได้
  - ล็อกอินด้วยรหัสผ่านผิด → ค้างที่ `/login` พร้อมข้อความ "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
  - ออกจากระบบ → กลับไปเห็นปุ่ม "เข้าสู่ระบบ" (ยืนยันว่า signOut ทำงานจริง)
  - Setup อยู่ที่ `e2e/` (`playwright.config.ts` ที่ root สั่ง webServer ให้รัน `next dev -p 3100` ด้วย
    `DATABASE_URL`/`AUTH_SECRET` แยกจากของจริง, `global-setup.ts` รัน `prisma migrate deploy` +
    `tsx e2e/seed.ts` สร้างผู้ใช้ทดสอบ (`upsert` กันชนกรณีไฟล์ db เก่าหลงเหลือ) ก่อนรัน,
    `global-teardown.ts`/`removeDbFiles.ts` ลบไฟล์ `e2e-test.db` ทิ้งหลังจบแบบ retry+warn ไม่ throw)
  - **หมายเหตุที่ต้องรู้**: บน Windows บางครั้ง Next dev server ที่เพิ่งถูก kill ยังไม่ปล่อย lock ไฟล์
    sqlite ทันที ทำให้ teardown ลบไฟล์ไม่สำเร็จบางรอบ (EBUSY) — จึงออกแบบให้แค่ warn ไม่ทำให้ทั้ง run fail
    (exit code ยังเป็น 0 ตราบใดที่เทสทั้งหมดผ่าน) ไฟล์ที่หลงเหลือถูก gitignore ไว้และรอบถัดไปจะลบเองหรือ
    ทับได้เพราะ migrate/seed เป็น idempotent
  - เพิ่ม `exclude: ["**/e2e/**"]` ใน `vitest.config.ts` เพราะ pattern default ของ Vitest จะไป match
    ไฟล์ `e2e/login.spec.ts` ด้วย (ชื่อ `*.spec.ts`) แล้วพังเพราะเป็นไฟล์ของ Playwright ไม่ใช่ Vitest
- **CI (GitHub Actions)**: เพิ่ม `.github/workflows/ci.yml` รันทุก push และทุก pull request บน
  `ubuntu-latest`, Node 22, 2 job แยกกันรันขนาน:
  - `test` — `npm ci` → `npx prisma generate` → `npm run test` (unit + integration ทั้ง 41 เคส)
  - `e2e` — `npm ci` → `npx prisma generate` → `npx playwright install --with-deps chromium` →
    `npm run test:e2e` (3 เคส login) พร้อม upload `test-results/` (Playwright trace) เป็น artifact
    เมื่อ fail เพื่อ debug ย้อนหลังได้
  - ไม่ต้องตั้ง repo secret ใดๆ — ทั้งสอง job สร้าง `DATABASE_URL`/`AUTH_SECRET` ของตัวเองแบบ self-contained
    ตามที่ออกแบบไว้ใน `src/test/setupEnv.ts` และ `e2e/testDb.ts` อยู่แล้ว (ไม่พึ่ง `.env` จริง)
  - ยังไม่ได้เพิ่ม `npm run lint`/`npm run build` เข้า CI — ขอบเขตตามที่ขอคือรันเทสที่มีอยู่เท่านั้น
    พิจารณาเพิ่มทีหลังถ้าต้องการเช็ค type/lint errors ใน CI ด้วย
  - เดิม pin ไว้ที่ Node 20 แต่ GitHub Actions runner บังคับ force รันเป็น Node 24 อยู่ดีพร้อม deprecation
    warning เลยปรับเป็น Node 22 (LTS ปัจจุบัน) แทนใน commit `0dabfbc` — ตรวจสอบใน Actions tab จริงแล้วว่า
    ทั้ง 2 run (Node 20 เดิมที่ commit `5fbc8fe` และ Node 22 ที่ `0dabfbc`) ผ่านสำเร็จทั้งคู่ ("completed
    successfully"), run หลัง Node 22 เร็วขึ้น (1m12s เทียบกับ 2m38s) เพราะไม่โดน force upgrade runtime กลางทาง

- **Donut chart บน Dashboard**: เพิ่ม `src/components/StatusDonutChart.tsx` (server component, ไม่มี client
  JS) แสดงสัดส่วนสถานะ 🟢/🟡/🔴 เป็นวงแหวน SVG (ใช้เทคนิค `stroke-dasharray`/`stroke-dashoffset` บน `<circle>`
  หมุน -90° ให้เริ่มที่ 12 นาฬิกา) พร้อมตัวเลขรวมกลางวง และ legend (จุดสี + label จาก `STATUS_LABEL` + จำนวน
  + เปอร์เซ็นต์) ตาม reference design ที่ลูกค้าให้มา — สีวงเป็น green-500/yellow-500/red-500 (`#22c55e`/
  `#eab308`/`#ef4444`) ให้เข้มพอเห็นชัดบนพื้นขาว ต่างจาก badge สถานะที่ใช้ทวี light shade (`*-100`/`*-800`)
  เพราะ badge อยู่บนพื้นขาวเป็นตัวหนังสือ ส่วนวงกลมต้องเป็นพื้นสีทึบ
  ตัวเลขสัดส่วนคำนวณจาก **เครื่องมือทั้งหมดในระบบ** (query แยกต่างหากที่ไม่ผูกกับคำค้นหา/pagination ของตาราง
  ด้านล่าง) เพื่อให้เป็นภาพรวมจริงเสมอ ไม่ใช่แค่หน้าที่กำลังดูอยู่ — ใช้ `getToolStatus()` ตัวเดิมคำนวณ
  (ไม่ derive สถานะด้วย SQL date range แยกต่างหาก กัน logic เพี้ยนจากต้นทาง)
  ทดสอบจริงในเบราว์เซอร์แล้วว่าวงแหวน/ตัวเลขกลาง/legend แสดงถูกต้องตามข้อมูลจริง ไม่มี console error
- **Dashboard overview widgets เพิ่มเติม (ตาม reference mockup ลูกค้า)**: ขยายเฉพาะเนื้อหาในหน้า
  `/dashboard` — **ไม่แตะโครงสร้าง nav ของทั้งระบบ** (ลูกค้าเลือกไม่ทำ sidebar เต็มรูปแบบ เพราะเมนูบางอย่างใน
  mockup เช่น "รายงานและกราฟ", "นำเข้าข้อมูล Excel", "ตั้งค่า" ยังไม่มีหน้าจริงในระบบ — คงเมนูบนแบบเดิมไว้)
  เพิ่ม:
  - `src/components/StatCard.tsx` + `src/components/icons.tsx` (ไอคอน outline สไตล์เดียวกับหน้าแรก) — การ์ด
    สรุปตัวเลข 4 ใบ (ทั้งหมด/ปกติ/ใกล้ครบกำหนด/หมดอายุ) พร้อมเปอร์เซ็นต์
  - `src/components/DueSummaryList.tsx` — ตารางย่อย reuse ได้ทั้งสอง panel: "เครื่องมือใกล้ครบกำหนด (ภายใน 30
    วัน)" (เรียงตามวันครบกำหนดใกล้สุดก่อน) และ "เครื่องมือที่หมดอายุ" (เรียงตามเกินกำหนดมากสุดก่อน) แสดงสูงสุด
    5 รายการต่อ panel — ไม่ได้ใส่ลิงก์ "ดูทั้งหมด" แบบใน mockup เพราะยังไม่มีหน้ารายการที่กรองตามสถานะแยกจริง
  - `src/components/MonthlyDueChart.tsx` — กราฟเส้น/พื้นที่ SVG (ไม่มี client JS เหมือนกัน) แสดงจำนวนเครื่องมือ
    แยกตามเดือนที่ครบกำหนด **เฉพาะปีปัจจุบัน** (เทียบ `expiryDate.getFullYear()` กับปีปัจจุบัน) สีน้ำเงินเดียว
    (`#3b82f6`) ตาม dataviz convention (sequential = hue เดียว)
  - เพิ่ม `getDaysRemaining()` ใน `src/lib/status.ts` (แยกออกมาจาก `getToolStatus()` เดิมที่คำนวณ diffDays
    inline) เพื่อไม่ให้ logic คำนวณ "เหลืออีก/เกินมาแล้วกี่วัน" ใน dashboard เพี้ยนไปจาก `getToolStatus()` —
    รัน `npm run test -- src/lib/status.test.ts` แล้วผ่านทั้ง 6 เคสเดิม (behavior ไม่เปลี่ยน)
  - ขยาย container ของหน้า dashboard จาก `max-w-5xl` เป็น `max-w-6xl` เพราะเนื้อหาแน่นขึ้นมาก (การ์ด 4 ใบ +
    กราฟ 2 คอลัมน์)
  - แก้ lint error `react-hooks/immutability` ใน `StatusDonutChart.tsx` (reassign ตัวแปร `cumulative` ระหว่าง
    render ไม่ได้ตาม React Compiler rule) เปลี่ยนเป็นคำนวณ prefix sum แบบ pure แทน — `npm run lint` ผ่านสะอาด
    สำหรับไฟล์ที่แก้ในงานนี้ (เจอ error เดิมที่ไม่เกี่ยวข้องใน `AlertBannerClient.tsx` — ไม่ได้แตะ เพราะนอก
    ขอบเขต ส่งเป็น background task แยกให้แก้ทีหลัง)
  - ทดสอบจริงในเบราว์เซอร์ (ผ่าน accessibility tree/`get_page_text`/console เพราะ screenshot tool ของ Browser
    pane timeout ชั่วคราวรอบนี้ ปัญหาเดิมที่เคยเจอมาก่อน — ไม่กระทบตัวแอป) ยืนยันตัวเลขการ์ด/โดนัท/รายการใกล้
    ครบกำหนด/รายการหมดอายุ/กราฟรายเดือนตรงกับข้อมูลจริงทั้งหมด ไม่มี console/server error
- **แก้ lint error `react-hooks/set-state-in-effect` ใน `AlertBannerClient.tsx`**: ของเดิมอ่าน
  `sessionStorage` แล้ว `setDismissed(...)` ใน `useEffect` (เพื่อให้ initial render บน client ตรงกับ server
  ก่อน — คือ `dismissed=false` เสมอตอน render แรก — ป้องกัน hydration mismatch เพราะ banner ทั้งก้อนจะ
  หาย/ปรากฏถ้าค่าตอน SSR กับ client ไม่ตรงกัน) แต่วิธีนี้โดน eslint rule ใหม่ (`react-hooks/set-state-in-effect`)
  ตีเพราะเป็นการ sync กับ external system (`sessionStorage`) — เปลี่ยนไปใช้ `useSyncExternalStore` แทน
  (เป็น API ที่ React ออกแบบมาสำหรับ subscribe external store ตรงๆ พร้อม `getServerSnapshot` เพื่อจัดการ
  SSR/hydration ให้ถูกต้องโดยไม่ต้อง setState ใน effect เอง) — ปุ่ม "ปิดการแจ้งเตือน" เปลี่ยนจาก
  `sessionStorage.setItem` + `setDismissed(true)` เป็นเรียก `dismissForToday()` ที่เขียน sessionStorage แล้ว
  notify listener ของ store เอง พฤติกรรมเดิมไม่เปลี่ยน (ปิดแล้วจำจนกว่าจะข้ามวัน ผ่าน `sessionStorage`) —
  `npm run lint`/`npx tsc --noEmit`/`npm run test` (41 เคส) ผ่านหมด และทดสอบจริงในเบราว์เซอร์แล้วว่ากดปิดได้
  ทันที, reload หน้าแล้วยังจำสถานะปิดไว้ (ไม่มี hydration warning ใน console)

- **Confirmation popup ก่อนเพิ่ม/แก้ไข/ลบเครื่องมือ**: เพิ่ม `src/components/ConfirmSubmitButton.tsx`
  (client component ใช้ `<dialog>` element มาตรฐาน HTML ไม่พึ่ง library ภายนอก) ครอบปุ่ม "เพิ่มเครื่องมือ",
  "บันทึก", "ลบ" ในหน้า `/tools/manage` (`src/app/tools/manage/page.tsx`) — กดปุ่มแล้วเช็ค
  `form.reportValidity()` ก่อน (รักษาพฤติกรรม required field เดิม) ถ้าผ่านค่อยเปิด dialog ยืนยัน
  ข้อความเฉพาะ action (ข้อความลบระบุด้วยว่าจะลบประวัติการสอบเทียบทั้งหมดด้วยและกู้คืนไม่ได้) กด "ยืนยัน"
  ถึงจะ submit ฟอร์มจริงผ่านปุ่ม `type="submit" formAction={...}` ข้างในตัว dialog เอง (ใช้ DOM nesting
  ปกติ ไม่ต้อง JS เชื่อม form) — ไม่แตะ logic ของ server action (`createTool`/`updateTool`/`deleteTool`)
  เลย เป็นแค่ชั้น UI ก่อนหน้า, ไม่เปลี่ยน RBAC (Editor ยังเพิ่ม/แก้ไข/ลบเครื่องมือได้เหมือนเดิมตามที่ลูกค้า
  ยืนยัน — "admin" ที่พูดถึงคือสิทธิ์ user management ใน `/admin` ซึ่งมีอยู่แล้ว ไม่ใช่ RBAC ของ tools)
  ขอบเขตเฉพาะหน้า `/tools/manage` เท่านั้น (ยังไม่ทำที่ `/admin` user management ตามที่ลูกค้าเลือก)
  ทดสอบจริงในเบราว์เซอร์แล้วว่า: กด "ลบ" เด้ง dialog ข้อความถูกต้องระบุ toolCode, กด "ยกเลิก" ปิด dialog
  โดยไม่ลบข้อมูลจริง (ยืนยันด้วย DOM query), กด "บันทึก" เด้ง dialog แล้วกด "ยืนยัน" submit ฟอร์มจริง
  สำเร็จไม่มี error — `npx tsc --noEmit`, `npx eslint`, `npm run test` (21 เคส unit tests) ผ่านหมด

## ช่องโหว่ / สิ่งที่ยังไม่สมบูรณ์ (Known gaps)

- ไม่มีระบบ self-service reset password — ต้องให้ Admin จัดการผ่านหน้า `/admin` เท่านั้น
- Alert Banner dismiss ใช้ `sessionStorage` แยกตามวันต่อแท็บเบราว์เซอร์ — ถ้ากดปิดระหว่างซ้อม demo
  จะไม่กลับมาอีกในแท็บนั้นจนกว่าจะข้ามวัน (ไม่ใช่บั๊ก แต่ต้องระวังตอน demo จริง)
- ยังไม่มีแผน production database — SQLite เหมาะกับ local/demo แต่ต้องประเมินใหม่ก่อน go-live จริง
  ถ้ามีผู้ใช้พร้อมกันเยอะ
- Nav links บนหน้าแรกเหลือ Service กับ Contact Us เป็น anchor (`#...`) ที่ยังไม่มีเนื้อหาปลายทางจริง
  (OEM Product, Technology, About Us ถูกตัดออกแล้ว — ดู decision log ด้านล่าง)

## แผนงานถัดไป (Next steps)

- คุยกับลูกค้าเรื่องแผน hosting/deploy ก่อน go-live (ตอนนี้ยัง local-only ตามนโยบายโปรเจกต์)

## บันทึกการตัดสินใจสำคัญ (Decision log)

- **2026-07-12** — ตัด nav links "OEM Product", "Technology", "About Us" ออกจากหน้าแรก (`src/app/page.tsx`)
  เหลือแค่ "Service" กับ "Contact Us" — ลูกค้าระบุว่าระบบนี้ใช้ภายในองค์กร ไม่ใช่ business/marketing
  website จึงไม่จำเป็นต้องมีเมนูสไตล์บริษัทครบชุดตาม reference design เดิม การ์ดฟีเจอร์หัวข้อ
  "Technology" (ใน section 3 คอลัมน์) ยังคงไว้เหมือนเดิมเพราะเป็นคนละส่วนกับ nav
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
