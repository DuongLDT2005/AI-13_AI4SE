import Booking from "../src/booking";

describe('Booking.applyPromotions()', () => {
  let booking;
  const baseData = {
    customerID: 1,
    eventTypeID: 1,
    hallID: 1,
    menuID: 1,
  };

  beforeEach(() => {
    booking = new Booking(baseData);
    booking.tableCount = 10;
    booking.originalPrice = 5000;
    booking.promotions = [];
  });

  // 1️⃣ Single valid percentage promotion
  it('applies a single percentage promotion correctly', async () => {
    const promotions = [{ discountType: 0, discountValue: 10, minTable: 5 }];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(500); // 5000 * 10%
    expect(booking.promotions).toEqual(promotions);
  });

  // 2️⃣ Multiple valid promotions
  it('applies multiple percentage promotions cumulatively', async () => {
    const promotions = [
      { discountType: 0, discountValue: 10, minTable: 5 },
      { discountType: 0, discountValue: 5, minTable: 5 }
    ];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(500 + 250); // 5000 * 15%
    expect(booking.promotions.length).toBe(2);
  });

  // 3️⃣ Free service promotion
  it('applies a free service promotion without changing discountAmount', async () => {
    const promotions = [{ discountType: 1, freeServiceID: 101, minTable: 5 }];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(0);
    expect(booking.promotions).toEqual(promotions);
    expect([...booking.getFreeServicesForTest()]).toContain(101);
  });

  // 4️⃣ Mixed promotions (percentage + free service)
  it('applies mixed promotions correctly', async () => {
    const promotions = [
      { discountType: 0, discountValue: 10, minTable: 5 },
      { discountType: 1, freeServiceID: 102, minTable: 5 }
    ];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(500);
    expect([...booking.getFreeServicesForTest()]).toContain(102);
  });

  // 5️⃣ Promotion below minTable threshold
  it('ignores promotions below minTable threshold', async () => {
    const promotions = [{ discountType: 0, discountValue: 10, minTable: 20 }];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(0);
    expect(booking.promotions).toEqual([]);
  });

  // 6️⃣ Empty promotions array
  it('handles empty promotions array', async () => {
    await booking.applyPromotions([]);
    expect(booking.discountAmount).toBe(0);
    expect(booking.promotions).toEqual([]);
  });

  // 7️⃣ promotions = undefined
  it('throws TypeError when promotions is undefined', async () => {
    await expect(booking.applyPromotions(undefined)).rejects.toThrow(TypeError);
  });

  // 8️⃣ Invalid discountType or missing fields
  it('ignores invalid promotions', async () => {
    const promotions = [
      { minTable: 3 }, // missing discountType
      { discountType: 5, discountValue: 10 } // unsupported discountType
    ];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(0);
    expect(booking.promotions).toEqual([]);
  });

  // 9️⃣ Floating discountValue
  it('calculates floating percentage discount accurately', async () => {
    const promotions = [{ discountType: 0, discountValue: 7.5, minTable: 5 }];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBeCloseTo(375); // 5000 * 7.5%
  });

  // 🔟 Duplicate promotions
  it('stacks duplicate promotions correctly', async () => {
    const promotions = [
      { discountType: 0, discountValue: 10, minTable: 5 },
      { discountType: 0, discountValue: 10, minTable: 5 }
    ];
    await booking.applyPromotions(promotions);

    expect(booking.discountAmount).toBe(1000); // 5000 * 20%
    expect(booking.promotions.length).toBe(2);
  });
});
