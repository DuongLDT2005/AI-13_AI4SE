// booking.calculateTotals.test.js
import Booking from "../src/booking.js";

describe('Booking.calculateTotals()', () => {
  let booking;
  let staticData;

  beforeEach(() => {
    // Static data setup (no DAO mocks)
    staticData = {
      customer: { id: 'C001', name: 'John Doe' },
      eventType: { id: 'E001', name: 'Wedding' },
      hall: { id: 'H001', name: 'Grand Hall', capacity: 300 },
      menu: { id: 'M001', name: 'Premium Buffet', price: 500 },
    };

    booking = new Booking({
      customer: staticData.customer,
      eventType: staticData.eventType,
      hall: staticData.hall,
      menu: staticData.menu,
      originalPrice: 1000,
      discountAmount: 100,
    });
  });

  afterEach(() => {
    booking = null;
  });

  // 1️⃣ Valid VAT rate (0.1)
  test('should correctly calculate VAT and totalAmount with valid VAT rate (0.1)', async () => {
    await booking.calculateTotals({ VAT_RATE: '0.1' });
    expect(booking.VAT).toBeCloseTo(900 * 0.1);
    expect(booking.totalAmount).toBeCloseTo(900 + 90);
  });

  // 2️⃣ Missing VAT_RATE → default 0.08
  test('should use default VAT_RATE = 0.08 when missing', async () => {
    await booking.calculateTotals({});
    expect(booking.VAT).toBeCloseTo(900 * 0.08);
    expect(booking.totalAmount).toBeCloseTo(900 + 72);
  });

  // 3️⃣ Invalid VAT_RATE string ("abc") → fallback to 0.08
  test('should fallback to default 0.08 when VAT_RATE is invalid string', async () => {
    await booking.calculateTotals({ VAT_RATE: 'abc' });
    expect(booking.VAT).toBeCloseTo(900 * 0.08);
    expect(booking.totalAmount).toBeCloseTo(900 + 72);
  });

  // 4️⃣ Negative VAT_RATE → fallback to 0.08
  test('should reset negative VAT_RATE to default 0.08', async () => {
    await booking.calculateTotals({ VAT_RATE: '-0.2' });
    expect(booking.VAT).toBeCloseTo(900 * 0.08);
    expect(booking.totalAmount).toBeCloseTo(900 + 72);
  });

  // 5️⃣ originalPrice not a number → throws
  test('should throw when originalPrice is not a number', async () => {
    booking.originalPrice = 'abc';
    await expect(booking.calculateTotals({ VAT_RATE: '0.1' }))
      .rejects
      .toThrow('originalPrice must be a number.');
  });

  // 6️⃣ discountAmount not a number → throws
  test('should throw when discountAmount is not a number', async () => {
    booking.discountAmount = 'xyz';
    await expect(booking.calculateTotals({ VAT_RATE: '0.1' }))
      .rejects
      .toThrow('discountAmount must be a number.');
  });

  // 7️⃣ discountAmount > originalPrice → totalAmount = 0
  test('should clamp totalAmount to 0 when discountAmount > originalPrice', async () => {
    booking.discountAmount = 2000;
    await booking.calculateTotals({ VAT_RATE: '0.1' });
    expect(booking.totalAmount).toBe(0);
  });

  // 8️⃣ Very large values → no overflow or precision loss
  test('should handle very large price and discount values without overflow', async () => {
    booking.originalPrice = 1e12;
    booking.discountAmount = 5e11;
    await booking.calculateTotals({ VAT_RATE: '0.1' });
    expect(booking.totalAmount).toBeCloseTo((1e12 - 5e11) * 1.1);
  });

  // 9️⃣ Decimal VAT and prices — floating point precision
  test('should handle decimal VAT and prices accurately', async () => {
    booking.originalPrice = 123.45;
    booking.discountAmount = 23.45;
    await booking.calculateTotals({ VAT_RATE: '0.075' });
    expect(booking.VAT).toBeCloseTo(100 * 0.075, 5);
    expect(booking.totalAmount).toBeCloseTo(100 + 7.5, 5);
  });

  // 🔟 Repeated calls — idempotent and recalculates correctly
  test('should recalculate consistently across repeated calls with modified values', async () => {
    await booking.calculateTotals({ VAT_RATE: '0.1' });
    const firstTotal = booking.totalAmount;

    booking.discountAmount = 200;
    await booking.calculateTotals({ VAT_RATE: '0.1' });
    const secondTotal = booking.totalAmount;

    expect(secondTotal).not.toEqual(firstTotal);
    expect(secondTotal).toBeCloseTo((800 * 1.1), 5);
  });
});