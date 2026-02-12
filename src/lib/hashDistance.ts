/**
 * Calculates the Hamming distance between two hex strings.
 * @param hex1 The first hex string.
 * @param hex2 The second hex string.
 * @returns The number of differing bits.
 */
export function calculateHammingDistance(hex1: string, hex2: string): number {
  if (hex1.length !== hex2.length) {
    throw new Error("Hashes must be of equal length");
  }

  let distance = 0;
  for (let i = 0; i < hex1.length; i++) {
    const val1 = parseInt(hex1[i], 16);
    const val2 = parseInt(hex2[i], 16);
    let xor = val1 ^ val2;

    // Count set bits in xor
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }

  return distance;
}
