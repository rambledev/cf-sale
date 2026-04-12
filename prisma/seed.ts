import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ──────────────────────────────────────────────
// PRODUCTS  (สินค้า Facebook / TikTok Live)
// ──────────────────────────────────────────────
const PRODUCTS = [
  { code: 'A01', name: 'เสื้อยืด Oversize (สีขาว)', price: 259,  stock: 48 },
  { code: 'A02', name: 'เสื้อยืด Oversize (สีดำ)',  price: 259,  stock: 35 },
  { code: 'B01', name: 'กางเกงวอร์ม ขายาว',         price: 349,  stock: 27 },
  { code: 'B02', name: 'กางเกงขาสั้น Sport',         price: 199,  stock: 40 },
  { code: 'C01', name: 'ครีมบำรุงผิวหน้า SPF50',     price: 590,  stock: 60 },
  { code: 'C02', name: 'เซรั่มวิตามินซี 30ml',       price: 790,  stock: 22 },
  { code: 'D01', name: 'หมวก Cap ปัก Logo',          price: 290,  stock: 55 },
  { code: 'D02', name: 'กระเป๋าผ้า Tote Bag',        price: 189,  stock: 80 },
  { code: 'E01', name: 'แก้ว Tumbler สแตนเลส 500ml', price: 450,  stock: 30 },
  { code: 'E02', name: 'พวงกุญแจอะคริลิค Custom',   price: 129,  stock: 120 },
]

// ──────────────────────────────────────────────
// CUSTOMERS  (ชื่อลูกค้า)
// ──────────────────────────────────────────────
const CUSTOMERS = [
  'มินตรา', 'ปิยะ', 'สุดา', 'กัญญา', 'ธนา',
  'อรอุมา', 'ภาณุ', 'วิชัย', 'นภา', 'เปรม',
  'ชลธิชา', 'พงษ์', 'รัตนา', 'ศิริ', 'โบว์',
  'แนน', 'ฟ้า', 'บิ๊ก', 'นิ้ง', 'แก้ม',
]

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── Workspace + User ──────────────────────────
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: {},
    create: { id: 'demo-workspace', name: 'Live Shop Demo' },
  })

  const pinHash = await bcrypt.hash('1234', 10)
  await prisma.user.upsert({
    where: { phone: '0800000000' },
    update: {},
    create: {
      name: 'เจ้าของร้าน',
      phone: '0800000000',
      pinHash,
      workspaceId: workspace.id,
    },
  })
  console.log('✔ workspace + user')

  // ── Products ──────────────────────────────────
  const createdProducts: { id: number; code: string; price: number }[] = []

  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { code_workspaceId: { code: p.code, workspaceId: workspace.id } },
      update: { name: p.name, price: p.price, stock: p.stock },
      create: { ...p, workspaceId: workspace.id },
    })
    createdProducts.push({ id: product.id, code: product.code, price: Number(product.price) })
  }
  console.log(`✔ ${createdProducts.length} products`)

  // ── Live Sessions ─────────────────────────────
  const liveSession = await prisma.liveSession.upsert({
    where: { slug: 'demo-live-01' },
    update: {},
    create: {
      slug: 'demo-live-01',
      title: 'ไลฟ์ลดราคาสุดพิเศษ 🔥',
      isActive: true,
      workspaceId: workspace.id,
    },
  })
  console.log('✔ live session')

  // ── Clean up old demo orders ───────────────────
  await prisma.orderItem.deleteMany({
    where: { order: { workspaceId: workspace.id } },
  })
  await prisma.order.deleteMany({ where: { workspaceId: workspace.id } })

  // ── Orders (20 รายการ) ────────────────────────
  const orderDefs = [
    // confirmed orders via COMMENT (14 รายการ)
    { customer: CUSTOMERS[0],  channel: 'COMMENT', status: 'confirmed', daysAgo: 0, items: [{ code: 'A01', qty: 2 }, { code: 'D01', qty: 1 }] },
    { customer: CUSTOMERS[1],  channel: 'COMMENT', status: 'confirmed', daysAgo: 0, items: [{ code: 'C01', qty: 1 }] },
    { customer: CUSTOMERS[2],  channel: 'COMMENT', status: 'confirmed', daysAgo: 1, items: [{ code: 'A02', qty: 1 }, { code: 'B01', qty: 1 }] },
    { customer: CUSTOMERS[3],  channel: 'COMMENT', status: 'confirmed', daysAgo: 1, items: [{ code: 'E01', qty: 2 }] },
    { customer: CUSTOMERS[4],  channel: 'COMMENT', status: 'confirmed', daysAgo: 1, items: [{ code: 'C02', qty: 1 }, { code: 'C01', qty: 1 }] },
    { customer: CUSTOMERS[5],  channel: 'COMMENT', status: 'confirmed', daysAgo: 2, items: [{ code: 'B02', qty: 3 }] },
    { customer: CUSTOMERS[6],  channel: 'COMMENT', status: 'confirmed', daysAgo: 2, items: [{ code: 'D02', qty: 2 }] },
    { customer: CUSTOMERS[7],  channel: 'COMMENT', status: 'confirmed', daysAgo: 3, items: [{ code: 'E02', qty: 5 }] },
    { customer: CUSTOMERS[8],  channel: 'COMMENT', status: 'confirmed', daysAgo: 3, items: [{ code: 'A01', qty: 1 }] },
    { customer: CUSTOMERS[9],  channel: 'COMMENT', status: 'confirmed', daysAgo: 4, items: [{ code: 'A02', qty: 2 }, { code: 'E01', qty: 1 }] },
    { customer: CUSTOMERS[10], channel: 'COMMENT', status: 'confirmed', daysAgo: 5, items: [{ code: 'C01', qty: 2 }] },
    { customer: CUSTOMERS[11], channel: 'COMMENT', status: 'confirmed', daysAgo: 6, items: [{ code: 'B01', qty: 1 }, { code: 'D01', qty: 2 }] },
    { customer: CUSTOMERS[12], channel: 'COMMENT', status: 'confirmed', daysAgo: 7, items: [{ code: 'E02', qty: 3 }] },
    { customer: CUSTOMERS[13], channel: 'COMMENT', status: 'confirmed', daysAgo: 7, items: [{ code: 'D02', qty: 1 }, { code: 'B02', qty: 1 }] },

    // pending orders via CART (6 รายการ – รอยืนยัน)
    { customer: CUSTOMERS[14], channel: 'CART', status: 'pending', daysAgo: 0, liveSessionId: liveSession.id, items: [{ code: 'A01', qty: 1 }] },
    { customer: CUSTOMERS[15], channel: 'CART', status: 'pending', daysAgo: 0, liveSessionId: liveSession.id, items: [{ code: 'C02', qty: 1 }, { code: 'C01', qty: 1 }] },
    { customer: CUSTOMERS[16], channel: 'CART', status: 'pending', daysAgo: 1, liveSessionId: liveSession.id, items: [{ code: 'E01', qty: 1 }] },
    { customer: CUSTOMERS[17], channel: 'CART', status: 'pending', daysAgo: 1, liveSessionId: liveSession.id, items: [{ code: 'D02', qty: 2 }] },
    { customer: CUSTOMERS[18], channel: 'CART', status: 'pending', daysAgo: 2, liveSessionId: liveSession.id, items: [{ code: 'B02', qty: 1 }, { code: 'D01', qty: 1 }] },
    { customer: CUSTOMERS[19], channel: 'CART', status: 'pending', daysAgo: 2, liveSessionId: liveSession.id, items: [{ code: 'E02', qty: 4 }] },
  ]

  const productMap = Object.fromEntries(createdProducts.map((p) => [p.code, p]))

  for (const def of orderDefs) {
    const createdAt = daysAgo(def.daysAgo + randomBetween(0, 0))

    await prisma.order.create({
      data: {
        customerName: def.customer,
        channel: def.channel,
        status: def.status,
        workspaceId: workspace.id,
        liveSessionId: def.liveSessionId ?? null,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: def.items.map((item) => ({
            productId: productMap[item.code].id,
            quantity: item.qty,
            workspaceId: workspace.id,
          })),
        },
      },
    })
  }
  console.log(`✔ ${orderDefs.length} orders`)

  // ── Summary ───────────────────────────────────
  const confirmedCount = orderDefs.filter((o) => o.status === 'confirmed').length
  const pendingCount   = orderDefs.filter((o) => o.status === 'pending').length

  const totalSales = orderDefs
    .filter((o) => o.status === 'confirmed')
    .flatMap((o) => o.items)
    .reduce((sum, item) => sum + productMap[item.code].price * item.qty, 0)

  console.log('')
  console.log('═══════════════════════════════════')
  console.log('  Seed complete!')
  console.log('───────────────────────────────────')
  console.log(`  สินค้า       : ${PRODUCTS.length} รายการ`)
  console.log(`  ออเดอร์      : ${orderDefs.length} รายการ`)
  console.log(`    confirmed  : ${confirmedCount}`)
  console.log(`    pending    : ${pendingCount}`)
  console.log(`  ยอดขายรวม   : ฿${totalSales.toLocaleString()}`)
  console.log('───────────────────────────────────')
  console.log('  Login  → phone : 0800000000')
  console.log('           PIN   : 1234')
  console.log('  Live link → /live/demo-live-01')
  console.log('═══════════════════════════════════')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
