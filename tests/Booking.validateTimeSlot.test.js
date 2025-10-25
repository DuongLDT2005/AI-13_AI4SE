import Booking from "../src/booking.js";
import { jest } from "@jest/globals";
describe("Booking.validateTimeSlot()", () => {
    let booking;
    let mockHallDAO;

    beforeEach(() => {
        mockHallDAO = {
            isAvailable: jest.fn().mockResolvedValue(true)
        };

        booking = new Booking();
        booking.hallDAO = mockHallDAO;
        booking.hallID = 1;
        booking.eventDate = "2025-11-01"; // fixed for consistency
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1️⃣ Buổi trưa — start/end auto-filled
    it("✅ should auto-fill start/end time for 'Buổi trưa' slot and resolve successfully", async () => {
        booking.timeSlot = "Buổi trưa";
        booking.startTime = undefined;
        booking.endTime = undefined;

        await expect(booking.validateTimeSlot()).resolves.toBeUndefined();
        expect(booking.startTime).toEqual("10:30:00");
        expect(booking.endTime).toEqual("14:00:00");
    });

    // 2️⃣ Buổi tối — start/end auto-filled
    it("✅ should auto-fill start/end time for 'Buổi tối' slot and resolve successfully", async () => {
        booking.timeSlot = "Buổi tối";
        booking.startTime = undefined;
        booking.endTime = undefined;

        await expect(booking.validateTimeSlot()).resolves.toBeUndefined();
        expect(booking.startTime).toEqual("17:30:00");
        expect(booking.endTime).toEqual("21:00:00");
    });

    // 3️⃣ Valid explicit times (Buổi trưa)
    it("✅ should resolve successfully for valid explicit Buổi trưa times", async () => {
        booking.timeSlot = "Buổi trưa";
        booking.startTime = "10:30:00";
        booking.endTime = "14:00:00";

        await expect(booking.validateTimeSlot()).resolves.toBeUndefined();
    });

    // 4️⃣ Valid explicit times (Buổi tối)
    it("✅ should resolve successfully for valid explicit Buổi tối times", async () => {
        booking.timeSlot = "Buổi tối";
        booking.startTime = "17:30:00";
        booking.endTime = "21:00:00";

        await expect(booking.validateTimeSlot()).resolves.toBeUndefined();
    });

    // 5️⃣ Lower regex boundary (00:00:00)
    it("❌ should throw when times are valid format but not a predefined slot (00:00:00)", async () => {
        booking.timeSlot = "Buổi trưa";
        booking.startTime = "00:00:00";
        booking.endTime = "00:00:00";

        await expect(booking.validateTimeSlot())
            .rejects
            .toThrow("startTime/endTime must match a predefined slot.");
    });

    // 6️⃣ Upper regex boundary (23:59:59)
    it("❌ should throw when times are valid format but not a predefined slot (23:59:59)", async () => {
        booking.timeSlot = "Buổi tối";
        booking.startTime = "23:59:59";
        booking.endTime = "23:59:59";

        await expect(booking.validateTimeSlot())
            .rejects
            .toThrow("startTime/endTime must match a predefined slot.");
    });

    // 7️⃣ Invalid startTime format
    it("❌ should throw when startTime format is invalid", async () => {
        booking.timeSlot = "Buổi trưa";
        booking.startTime = "10:30";
        booking.endTime = "14:00:00";

        await expect(booking.validateTimeSlot())
            .rejects
            .toThrow("startTime/endTime format invalid (HH:mm:ss)");
    });

    // 8️⃣ Invalid endTime format
    it("❌ should throw when endTime format is invalid", async () => {
        booking.timeSlot = "Buổi tối";
        booking.startTime = "17:30:00";
        booking.endTime = "21:00";

        await expect(booking.validateTimeSlot())
            .rejects
            .toThrow("startTime/endTime format invalid (HH:mm:ss)");
    });

    // 9️⃣ Valid format but not matching predefined slot
    it("❌ should throw when valid formatted times do not match any predefined slot", async () => {
        booking.timeSlot = "Buổi trưa";
        booking.startTime = "09:00:00";
        booking.endTime = "12:00:00";

        await expect(booking.validateTimeSlot())
            .rejects
            .toThrow("startTime/endTime must match a predefined slot.");
    });

    // 🔟 Valid times but hall unavailable
    it("❌ should throw when hall is not available for the selected time slot", async () => {
        booking.timeSlot = "Buổi tối";
        booking.startTime = "17:30:00";
        booking.endTime = "21:00:00";
        mockHallDAO.isAvailable.mockResolvedValue(false);

        await expect(booking.validateTimeSlot())
            .rejects
            .toThrow("The hall is not available for the selected date and time slot.");
    });
});