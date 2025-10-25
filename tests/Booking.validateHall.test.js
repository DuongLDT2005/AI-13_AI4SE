import Booking from "../src/booking";

describe('Booking.validateHall() — using static data', () => {
    let booking;
    let staticHallDAO;

    beforeEach(() => {
        // Static fake hall data (simulating database)
        const halls = [
            { hallID: 1, name: 'Grand Hall', minTable: 10, maxTable: 20 },
            { hallID: 2, name: 'Mini Hall', minTable: 12, maxTable: 12 },
            { hallID: 3, name: 'Economy Hall', minTable: 1, maxTable: 10 },
        ];

        // Simulated DAO with an async findById
        staticHallDAO = {
            findById: async (id) => halls.find((h) => h.hallID === id) || null,
        };

        // Default booking
        booking = new Booking({
            hallID: 1,
            tableCount: 15,
        });

        // Inject our static DAO
        booking.hallDAO = staticHallDAO;
    });

    afterAll(() => {
        booking = null;
        staticHallDAO = null;
    });

    // -------------------- HAPPY PATHS --------------------

    test('✅ should pass when hall exists and tableCount is within valid range', async () => {
        await expect(booking.validateHall()).resolves.toBeUndefined();
    });

    test('✅ should pass when tableCount equals hall.minTable (lower boundary)', async () => {
        booking.tableCount = 10;
        await expect(booking.validateHall()).resolves.toBeUndefined();
    });

    test('✅ should pass when tableCount equals hall.maxTable (upper boundary)', async () => {
        booking.tableCount = 20;
        await expect(booking.validateHall()).resolves.toBeUndefined();
    });

    // -------------------- ERROR SCENARIOS --------------------

    test('❌ should throw error when hall not found', async () => {
        booking.hallID = 999; // Nonexistent hall
        await expect(booking.validateHall()).rejects.toThrow('Hall not found for validation.');
    });

    test('❌ should throw error when tableCount is less than hall.minTable', async () => {
        booking.tableCount = 9;
        await expect(booking.validateHall()).rejects.toThrow(
            'Table count (9) must be between 10 and 20.'
        );
    });

    test('❌ should throw error when tableCount is greater than hall.maxTable', async () => {
        booking.tableCount = 21;
        await expect(booking.validateHall()).rejects.toThrow(
            'Table count (21) must be between 10 and 20.'
        );
    });

    test('❌ should throw error when hallID is undefined', async () => {
        booking.hallID = undefined;
        await expect(booking.validateHall()).rejects.toThrow('Hall not found for validation.');
    });

    test('❌ should throw error when tableCount is undefined', async () => {
        booking.tableCount = undefined;
        await expect(booking.validateHall()).rejects.toThrow('Table count is missing or invalid.');
    });

    test('✅ should pass when hall allows exactly one table count (min = max)', async () => {
        booking.hallID = 2; // Mini Hall
        booking.tableCount = 12;
        await expect(booking.validateHall()).resolves.toBeUndefined();
    });

    test('❌ should throw when hall allows only one table count but mismatch', async () => {
        booking.hallID = 2;
        booking.tableCount = 13;
        await expect(booking.validateHall()).rejects.toThrow(
            'Table count (13) must be between 12 and 12.'
        );
    });

    test('❌ should throw error when tableCount is negative', async () => {
        booking.hallID = 3;
        booking.tableCount = -5;
        await expect(booking.validateHall()).rejects.toThrow(
            'Table count (-5) must be between 1 and 10.'
        );
    });

    test('❌ should throw error when tableCount is zero (below min)', async () => {
        booking.hallID = 3;
        booking.tableCount = 0;
        await expect(booking.validateHall()).rejects.toThrow(
            'Table count (0) must be between 1 and 10.'
        );
    });
});