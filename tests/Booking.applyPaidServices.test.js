/**
 * @file Booking.applyPaidServices.test.js
 * ✅ Jest unit tests for Booking.applyPaidServices() — full coverage (10 test cases)
 */

import Booking from "../src/booking";

// ✅ Danh sách dịch vụ mẫu (không cần mock DB/DAO)
const allServices = [
  { serviceID: 'S1', name: 'Decoration', price: 100 },
  { serviceID: 'S2', name: 'Sound System', price: 200.5 },
  { serviceID: 'S3', name: 'Lighting', price: 50.75 }
];

describe('Booking.applyPaidServices()', () => {
  let booking;

  beforeEach(() => {
    booking = new Booking();
    booking.originalPrice = 1000; // giá ban đầu (base price)
  });

  afterEach(() => {
    booking = null;
  });

  test('1️⃣ Valid single service — đúng tổng tiền và appliedPrice', async () => {
    booking.services = [{ serviceID: 'S1', quantity: 2 }];

    await booking.applyPaidServices(allServices);

    expect(booking.originalPrice).toBe(1200);
    expect(booking.services).toEqual([
      { serviceID: 'S1', quantity: 2, appliedPrice: 200 }
    ]);
  });

  test('2️⃣ Multiple valid services — tính đúng cộng dồn nhiều dịch vụ', async () => {
    booking.services = [
      { serviceID: 'S1', quantity: 1 },
      { serviceID: 'S2', quantity: 2 }
    ];

    await booking.applyPaidServices(allServices);

    const totalAdded = 100 * 1 + 200.5 * 2;
    expect(booking.originalPrice).toBeCloseTo(1000 + totalAdded);
    expect(booking.services).toEqual([
      { serviceID: 'S1', quantity: 1, appliedPrice: 100 },
      { serviceID: 'S2', quantity: 2, appliedPrice: 401 }
    ]);
  });

  test('3️⃣ Service not found — throws "Service ID <id> not found."', async () => {
    booking.services = [{ serviceID: 'S99', quantity: 1 }];

    await expect(booking.applyPaidServices(allServices))
      .rejects.toThrow('Service ID S99 not found.');
  });

  test('4️⃣ Service already free — throws "Service ID <id> is already free."', async () => {
    booking.services = [{ serviceID: 'S1', quantity: 1 }];
    // ✅ Truy cập private #freeServices thông qua hàm hỗ trợ test
    booking._addFreeServiceForTest('S1');

    await expect(booking.applyPaidServices(allServices))
      .rejects.toThrow('Service ID S1 is already free.');
  });

  test('5️⃣ Empty this.services — originalPrice không đổi và services vẫn là []', async () => {
    booking.services = [];

    await booking.applyPaidServices(allServices);

    expect(booking.originalPrice).toBe(1000);
    expect(booking.services).toEqual([]);
  });

  test('6️⃣ Quantity = 0 — appliedPrice = 0, không lỗi', async () => {
    booking.services = [{ serviceID: 'S1', quantity: 0 }];

    await booking.applyPaidServices(allServices);

    expect(booking.originalPrice).toBe(1000);
    expect(booking.services).toEqual([
      { serviceID: 'S1', quantity: 0, appliedPrice: 0 }
    ]);
  });

  test('7️⃣ Negative quantity (edge) — chấp nhận giá âm (≈ logic hiện tại)', async () => {
    booking.services = [{ serviceID: 'S1', quantity: -2 }];

    await booking.applyPaidServices(allServices);

    expect(booking.originalPrice).toBe(1000 + 100 * -2); // = 800
    expect(booking.services[0].appliedPrice).toBe(-200);
  });

  test('8️⃣ Decimal price — kiểm tra với toBeCloseTo (số thực)', async () => {
    booking.services = [{ serviceID: 'S2', quantity: 1 }];

    await booking.applyPaidServices(allServices);

    expect(booking.originalPrice).toBeCloseTo(1200.5, 2);
    expect(booking.services[0].appliedPrice).toBeCloseTo(200.5, 2);
  });

  test('9️⃣ Very large quantity — không bị lỗi số lớn hoặc overflow', async () => {
    booking.services = [{ serviceID: 'S1', quantity: 1_000_000 }];

    await booking.applyPaidServices(allServices);

    expect(booking.originalPrice).toBe(1000 + 100 * 1_000_000);
    expect(booking.services[0].appliedPrice).toBe(100_000_000);
  });

  test('🔟 Missing serviceID — throws "Service ID undefined not found."', async () => {
    booking.services = [{ quantity: 1 }];

    await expect(booking.applyPaidServices(allServices))
      .rejects.toThrow('Service ID undefined not found.');
  });
});
