// Booking.calculateBasePrice.test.js
import Booking from "../src/booking";

describe('Booking.calculateBasePrice()', () => {
    let booking;
    let hallMock, menuMock;

    // Setup before each test
    beforeEach(() => {
        booking = new Booking();
        hallMock = { price: 2000 };
        menuMock = { price: 500 };
        booking.tableCount = 10;
    });

    // Teardown after each test
    afterEach(() => {
        booking = null;
        hallMock = null;
        menuMock = null;
    });

    // 1️⃣ Standard Calculation
    test('should correctly calculate originalPrice with valid inputs', async () => {
        await booking.calculateBasePrice(hallMock, menuMock);
        expect(booking.originalPrice).toEqual(2000 + 500 * 10); // 7000
    });

    // 2️⃣ Overwriting Existing Price
    test('should overwrite existing originalPrice if already set', async () => {
        booking.originalPrice = 9999;
        await booking.calculateBasePrice(hallMock, menuMock);
        expect(booking.originalPrice).toEqual(2000 + 500 * 10);
    });

    // 3️⃣ Zero Table Count
    test('should handle tableCount = 0 and compute only hall price', async () => {
        booking.tableCount = 0;
        await booking.calculateBasePrice(hallMock, menuMock);
        expect(booking.originalPrice).toEqual(2000 + 500 * 0); // 2000
    });

    // 4️⃣ Zero Prices
    test('should handle both hall and menu prices = 0', async () => {
        hallMock.price = 0;
        menuMock.price = 0;
        await booking.calculateBasePrice(hallMock, menuMock);
        expect(booking.originalPrice).toEqual(0);
    });

    // 5️⃣ Only Hall Price is Zero
    test('should calculate correctly when hall price is zero', async () => {
        hallMock.price = 0;
        await booking.calculateBasePrice(hallMock, menuMock);
        expect(booking.originalPrice).toEqual(0 + 500 * 10); // 5000
    });

    // 6️⃣ Invalid Hall Price (string)
    test('should throw error when hall.price is not a number (string)', async () => {
        hallMock.price = '2000';
        await expect(booking.calculateBasePrice(hallMock, menuMock))
            .rejects
            .toThrow('Hall or menu price must be a number.');
    });

    // 7️⃣ Null Hall Price
    test('should throw error when hall.price is null', async () => {
        hallMock.price = null;
        await expect(booking.calculateBasePrice(hallMock, menuMock))
            .rejects
            .toThrow('Hall or menu price must be a number.');
    });

    // 8️⃣ Undefined tableCount
    test('should throw error when tableCount is undefined', async () => {
        booking.tableCount = undefined;
        await expect(booking.calculateBasePrice(hallMock, menuMock))
            .rejects
            .toThrow('tableCount must be a number.');
    });

    // 8b️⃣ tableCount is a string
    test('should throw error when tableCount is a string', async () => {
        booking.tableCount = '10';
        await expect(booking.calculateBasePrice(hallMock, menuMock))
            .rejects
            .toThrow('tableCount must be a number.');
    });
});