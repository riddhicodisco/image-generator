
import { calculateMeeshoShipping } from '../src/lib/shipping/calc';

const CATEGORIES = [
  { id: "10000", name: "Men T-shirts" },
  { id: "10001", name: "Men Shirts" },
  { id: "10002", name: "Women Kurti" },
  { id: "10003", name: "Women Sarees" },
];

function testShipping() {
  console.log("Testing Shipping Logic...");

  CATEGORIES.forEach(cat => {
    let weight = 0.4;
    switch (cat.id) {
      case '10001': weight = 0.6; break;
      case '10002': weight = 0.8; break;
      case '10003': weight = 1.2; break;
      default: weight = 0.4;
    }

    const calc = calculateMeeshoShipping(weight, 'NATIONAL');
    console.log(`Category: ${cat.name} (${cat.id}) | Weight: ${weight}kg | Zone: NATIONAL | Charge: ₹${calc.charge}`);
  });
}

testShipping();
