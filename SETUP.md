# CF Sale — Setup Instructions

## Prerequisites
- Node.js 18+
- PostgreSQL running locally

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Edit `.env` with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cf_sale"
ADMIN_PASSWORD="admin1234"
```

## 3. Create Database & Run Migrations

```bash
# Push schema to DB (creates all tables including LiveSession)
npx prisma db push

# Seed sample products (A01 เสื้อดำ, B02 กางเกง)
npm run db:seed
```

> If DB was already running with old schema, run migrate instead:
> ```bash
> npx prisma migrate dev --name add_live_session
> ```

## 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Pages

| Path | Description |
|------|-------------|
| `/` | Dashboard — stats overview |
| `/products` | Manage products and stock |
| `/comments` | Paste comments → parse → confirm |

## Comment Format Supported

```
โบ A01 2          → name: โบ, code: A01, qty: 2
แดง A01 1         → name: แดง, code: A01, qty: 1
A01 2             → no name, code: A01, qty: 2
A01 x2            → no name, code: A01, qty: 2
text text A01 x2  → name: text text, code: A01, qty: 2
```

## Workflow

1. Go to **/comments**
2. Paste Live comment lines into the textarea
3. Click **ประมวลผลคอมเมนต์** (Process)
4. Review parsed table — invalid codes show as errors
5. Click **ยืนยัน** per row, or **ยืนยันทั้งหมด** for all
6. Click a confirmed row → see order summary + copy message to send customer

## Other Commands

```bash
npx prisma studio    # Visual DB browser
npx prisma db push   # Re-sync schema (dev)
npm run build        # Production build
npm run start        # Production server
```
