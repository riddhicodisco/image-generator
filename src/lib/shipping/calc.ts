export interface ShippingRate {
  local: number;
  regional: number;
  national: number;
}

export const SHIPPING_SLABS: Record<string, ShippingRate> = {
  '0-500g': { local: 45, regional: 55, national: 72 },
  '500g-1kg': { local: 65, regional: 80, national: 105 },
  '1kg-1.5kg': { local: 85, regional: 105, national: 140 },
  '1.5kg-2kg': { local: 105, regional: 130, national: 175 },
};

export function calculateMeeshoShipping(weightKg: number, zone: 'LOCAL' | 'REGIONAL' | 'NATIONAL') {
  let slab = '0-500g';
  let rate: ShippingRate = SHIPPING_SLABS['0-500g'];

  if (weightKg <= 0.5) {
    slab = '0-500g';
    rate = SHIPPING_SLABS['0-500g'];
  } else if (weightKg <= 1.0) {
    slab = '500g-1kg';
    rate = SHIPPING_SLABS['500g-1kg'];
  } else if (weightKg <= 1.5) {
    slab = '1kg-1.5kg';
    rate = SHIPPING_SLABS['1kg-1.5kg'];
  } else {
    slab = '1.5kg-2kg';
    rate = SHIPPING_SLABS['1.5kg-2kg'];
  }

  const charge = zone === 'LOCAL' ? rate.local : zone === 'REGIONAL' ? rate.regional : rate.national;

  return {
    charge,
    slab,
    weight: weightKg,
    zone
  };
}
