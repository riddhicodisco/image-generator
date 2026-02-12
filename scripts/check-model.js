
const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient();
  try {
    console.log("Checking if prisma.product is defined...");
    if (prisma.product) {
      console.log("SUCCESS: prisma.product is defined.");
      const count = await prisma.product.count();
      console.log("Current product count:", count);
    } else {
      console.error("FAILURE: prisma.product is UNDEFINED. You must run 'npx prisma generate'.");
    }
  } catch (e) {
    console.error("Error during check:", e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
