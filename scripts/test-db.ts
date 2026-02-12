
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Connected successfully.");

    console.log("Querying database...");
    const products = await prisma.product.findMany({ take: 1 });
    console.log("Products found:", products.length);
    console.log("Success!");
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
