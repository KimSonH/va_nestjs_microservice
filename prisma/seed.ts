import { Admin, PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const createDefaultAdmin = async (): Promise<Admin> => {
  return await prisma.admin.create({
    data: {
      first_name: process.env.ADMIN_FIRSTNAME,
      last_name: process.env.ADMIN_LASTNAME,
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    }
  })
}

async function main() {
  await createDefaultAdmin()
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
