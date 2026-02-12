
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');

console.log("Checking PrismaClient...");
try {
  const prisma = new PrismaClient();
  console.log("PrismaClient initialized successfully.");
} catch (e) {
  console.error("PrismaClient initialization failed:", e);
}

console.log("Checking sharp...");
try {
  const s = sharp();
  console.log("sharp initialized successfully.");
} catch (e) {
  console.error("sharp initialization failed:", e);
}
