import { addHours, addYears, formatISO } from "date-fns";
import Booking from "../src/booking";
import { jest } from "@jest/globals"

describe("Booking.validateEventDate()", () => {
    let booking;
    let systemSettings;
    let now;

    beforeEach(() => {
        now = new Date();
        systemSettings = { DEFAULT_MIN_BOOKING_NOTICE_HOURS: "24" };

        booking = new Booking({
            eventDate: null,
        });

        // Mock Date globally to control "current time"
        jest.useFakeTimers();
        jest.setSystemTime(now);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // 1️⃣ Event date within valid window
    it("✅ should resolve when event date is within the valid window", async () => {
        booking.eventDate = formatISO(addHours(now, 48)); // 2 days from now
        await expect(booking.validateEventDate(systemSettings, now)).resolves.toBeUndefined();
    });

    // 2️⃣ Exactly at minimum notice
    it("✅ should resolve when event date is exactly at the minimum notice (24h)", async () => {
        booking.eventDate = formatISO(addHours(now, 24), 1);
        await expect(booking.validateEventDate(systemSettings, now)).resolves.toBeUndefined();
    });

    // 3️⃣ Exactly 1 year ahead
    it("✅ should resolve when event date is exactly 1 year ahead", async () => {
        booking.eventDate = formatISO(addYears(now, 1));
        await expect(booking.validateEventDate(systemSettings, now)).resolves.toBeUndefined();
    });

    // 4️⃣ Event date less than min notice
    it("❌ should throw error when event date is less than the minimum notice", async () => {
        booking.eventDate = formatISO(addHours(now, 12)); // 12h ahead
        await expect(booking.validateEventDate(systemSettings, now))
            .rejects.toThrow("Event date must be at least 24 hours from now.");
    });

    // 5️⃣ Event date in the past
    it("❌ should throw error when event date is in the past", async () => {
        booking.eventDate = formatISO(addHours(now, -5)); // 5h ago
        await expect(booking.validateEventDate(systemSettings, now))
            .rejects.toThrow("Event date must be at least 24 hours from now.");
    });

    // 6️⃣ Event date more than 1 year ahead
    it("❌ should throw error when event date is more than 1 year in advance", async () => {
        booking.eventDate = formatISO(addHours(addYears(now, 1), 25));
        await expect(booking.validateEventDate(systemSettings, now))
            .rejects.toThrow("Event date cannot be more than 1 year in advance.");
    });

    // 7️⃣ Invalid date string format
    it("❌ should throw error when event date is not a valid date string", async () => {
        booking.eventDate = "not-a-date";
        await expect(booking.validateEventDate(systemSettings, now))
            .rejects.toThrow("eventDate must be a valid date string (e.g., YYYY-MM-DD).");
    })

    // 8️⃣ Missing eventDate property
    it("❌ should throw error when eventDate is undefined", async () => {
        booking.eventDate = undefined;
        await expect(booking.validateEventDate(systemSettings, now))
            .rejects.toThrow("eventDate must be a valid date string (e.g., YYYY-MM-DD).");
    });
});