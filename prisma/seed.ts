import { clerkClient } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await (await clerkClient()).users.getUserList()

  const insertItems = users.data.map(item => ({
    userId: item.id,
    firstName: item.firstName as string,
    lastName: item.lastName as string
  }))

  await prisma.user.createMany({
    data: insertItems
  })

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
