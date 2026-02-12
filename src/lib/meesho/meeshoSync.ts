import prisma from '../db/prisma';

/**
 * Manually syncs or updates a shipping charge for a specific hash.
 * @param hash Image hash
 * @param charge Shipping charge
 */
export async function syncMeeshoCharge(hash: string, charge: number) {
  return await prisma.product.upsert({
    where: { hash },
    update: { shippingCharge: charge },
    create: {
      hash,
      shippingCharge: charge,
      imagePath: '', // Will be updated if image is uploaded
    },
  });
}

/**
 * Retrieves shipping charge by hash.
 */
export async function getChargeByHash(hash: string) {
  return await prisma.product.findUnique({
    where: { hash },
  });
}
