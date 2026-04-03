import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.product.upsert({
    where: { code: 'A01' },
    update: {},
    create: {
      code: 'A01',
      name: 'เสื้อดำ',
      price: 100,
      stock: 10,
    },
  })

  await prisma.product.upsert({
    where: { code: 'B02' },
    update: {},
    create: {
      code: 'B02',
      name: 'กางเกง',
      price: 200,
      stock: 5,
    },
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
