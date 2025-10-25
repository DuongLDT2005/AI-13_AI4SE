import Booking from "../src/booking.js";
import { jest } from "@jest/globals";

describe("Booking.validateHall()", () => {
    let booking;
    let mockHallDAO;
    let mockHall;

    // ✅ Setup before each test
    beforeEach(() => {
        mockHallDAO = {
            findById: jest.fn(),
        };

        mockHall = { hallID: 1, minTable: 5, maxTable: 15 };

        booking = new Booking({
            hallID: 1,
            tableCount: 10,
            hallDAO: mockHallDAO,
        });
    });

    // 🧹 Teardown after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1️⃣ Table count within range
    it("✅ should resolve successfully when table count is within range", async () => {
        mockHallDAO.findById.mockResolvedValue(mockHall);

        await expect(booking.validateHall()).resolves.toBeUndefined();
        expect(mockHallDAO.findById).toHaveBeenCalledWith(1);
    });

    // 2️⃣ Table count equals minTable
    it("✅ should resolve when table count equals minTable", async () => {
        booking.tableCount = mockHall.minTable;
        mockHallDAO.findById.mockResolvedValue(mockHall);

        await expect(booking.validateHall()).resolves.toBeUndefined();
    });

    // 3️⃣ Table count equals maxTable
    it("✅ should resolve when table count equals maxTable", async () => {
        booking.tableCount = mockHall.maxTable;
        mockHallDAO.findById.mockResolvedValue(mockHall);

        await expect(booking.validateHall()).resolves.toBeUndefined();
    });

    // 4️⃣ Below minimum table count
    it("❌ should throw an error when table count is below minimum", async () => {
        booking.tableCount = 4;
        mockHallDAO.findById.mockResolvedValue(mockHall);

        await expect(booking.validateHall()).rejects.toThrow(
            "Table count (4) must be between 5 and 15."
        );
    });

    // 5️⃣ Above maximum table count
    it("❌ should throw an error when table count is above maximum", async () => {
        booking.tableCount = 16;
        mockHallDAO.findById.mockResolvedValue(mockHall);

        await expect(booking.validateHall()).rejects.toThrow(
            "Table count (16) must be between 5 and 15."
        );
    });

    // 6️⃣ tableCount missing (undefined)
    it("❌ should throw an error when table count is missing (undefined)", async () => {
        booking.tableCount = undefined;

        await expect(booking.validateHall()).rejects.toThrow(
            "Table count is missing or invalid."
        );
        expect(mockHallDAO.findById).not.toHaveBeenCalled();
    });

    // 7️⃣ tableCount not a number (string)
    it("❌ should throw an error when table count is not a number (string)", async () => {
        booking.tableCount = "10";

        await expect(booking.validateHall()).rejects.toThrow(
            "Table count is missing or invalid."
        );
        expect(mockHallDAO.findById).not.toHaveBeenCalled();
    });

    // 8️⃣ tableCount NaN
    it("❌ should throw an error when table count is NaN", async () => {
        booking.tableCount = NaN;

        await expect(booking.validateHall()).rejects.toThrow(
            "Table count is missing or invalid."
        );
        expect(mockHallDAO.findById).not.toHaveBeenCalled();
    });

    // 9️⃣ Hall not found (DAO returns null)
    it("❌ should throw an error when hall is not found", async () => {
        mockHallDAO.findById.mockResolvedValue(null);

        await expect(booking.validateHall()).rejects.toThrow(
            "Hall not found for validation."
        );
        expect(mockHallDAO.findById).toHaveBeenCalledWith(1);
    });
});