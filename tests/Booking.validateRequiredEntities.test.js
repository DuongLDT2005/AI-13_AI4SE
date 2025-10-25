import { describe, beforeEach, afterEach, it, expect, jest } from "@jest/globals";
import Booking from "../src/booking";

describe("Booking.validateRequiredEntities()", () => {
    let booking;
    let mockCustomerDAO, mockEventTypeDAO, mockHallDAO, mockMenuDAO;

    // ✅ Static mock data
    const mockCustomer = { id: 1, name: "Alice" };
    const mockEventType = { id: 2, type: "Wedding" };
    const mockHall = { id: 3, name: "Grand Hall" };
    const mockMenu = { id: 4, name: "Deluxe Menu" };

    beforeEach(() => {
        // 🧩 Mock DAOs
        mockCustomerDAO = { findById: jest.fn() };
        mockEventTypeDAO = { findById: jest.fn() };
        mockHallDAO = { findById: jest.fn() };
        mockMenuDAO = { findById: jest.fn() };

        // 🧩 Create a new Booking instance before each test
        booking = new Booking();
        booking.customerDAO = mockCustomerDAO;
        booking.eventTypeDAO = mockEventTypeDAO;
        booking.hallDAO = mockHallDAO;
        booking.menuDAO = mockMenuDAO;

        // ✅ Default valid IDs
        booking.customerID = 1;
        booking.eventTypeID = 2;
        booking.hallID = 3;
        booking.menuID = 4;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1️⃣ All entities found
    it("✅ should resolve successfully when all entities are found", async () => {
        mockCustomerDAO.findById.mockResolvedValue(mockCustomer);
        mockEventTypeDAO.findById.mockResolvedValue(mockEventType);
        mockHallDAO.findById.mockResolvedValue(mockHall);
        mockMenuDAO.findById.mockResolvedValue(mockMenu);

        await expect(booking.validateRequiredEntities()).resolves.toBeUndefined();

        expect(mockCustomerDAO.findById).toHaveBeenCalledWith(1);
        expect(mockEventTypeDAO.findById).toHaveBeenCalledWith(2);
        expect(mockHallDAO.findById).toHaveBeenCalledWith(3);
        expect(mockMenuDAO.findById).toHaveBeenCalledWith(4);
    });

    // 2️⃣ Customer record missing
    it("❌ should throw an error when customer record is missing", async () => {
        mockCustomerDAO.findById.mockResolvedValue(null);
        mockEventTypeDAO.findById.mockResolvedValue(mockEventType);
        mockHallDAO.findById.mockResolvedValue(mockHall);
        mockMenuDAO.findById.mockResolvedValue(mockMenu);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Customer record not found in database.");
    });

    // 3️⃣ Event type record missing
    it("❌ should throw an error when event type record is missing", async () => {
        mockCustomerDAO.findById.mockResolvedValue(mockCustomer);
        mockEventTypeDAO.findById.mockResolvedValue(null);
        mockHallDAO.findById.mockResolvedValue(mockHall);
        mockMenuDAO.findById.mockResolvedValue(mockMenu);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Event type record not found in database.");
    });

    // 4️⃣ Hall record missing
    it("❌ should throw an error when hall record is missing", async () => {
        mockCustomerDAO.findById.mockResolvedValue(mockCustomer);
        mockEventTypeDAO.findById.mockResolvedValue(mockEventType);
        mockHallDAO.findById.mockResolvedValue(null);
        mockMenuDAO.findById.mockResolvedValue(mockMenu);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Hall record not found in database.");
    });

    // 5️⃣ Menu record missing
    it("❌ should throw an error when menu record is missing", async () => {
        mockCustomerDAO.findById.mockResolvedValue(mockCustomer);
        mockEventTypeDAO.findById.mockResolvedValue(mockEventType);
        mockHallDAO.findById.mockResolvedValue(mockHall);
        mockMenuDAO.findById.mockResolvedValue(null);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Menu record not found in database.");
    });

    // 6️⃣ Invalid customerID
    it("❌ should throw an error when customerID is invalid", async () => {
        booking.customerID = null;
        mockCustomerDAO.findById.mockResolvedValue(null);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Customer record not found in database.");
    });

    // 7️⃣ Invalid eventTypeID
    it("❌ should throw an error when eventTypeID is invalid", async () => {
        booking.eventTypeID = undefined;

        // All prior DAOs must return valid data
        mockCustomerDAO.findById.mockResolvedValue(mockCustomer);
        mockEventTypeDAO.findById.mockResolvedValue(null); // invalid
        mockHallDAO.findById.mockResolvedValue(mockHall);
        mockMenuDAO.findById.mockResolvedValue(mockMenu);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Event type record not found in database.");
    });

    // 8️⃣ Invalid hallID
    it("❌ should throw an error when hallID is invalid", async () => {
        booking.hallID = undefined;

        // All prior DAOs must return valid data
        mockCustomerDAO.findById.mockResolvedValue(mockCustomer);
        mockEventTypeDAO.findById.mockResolvedValue(mockEventType);
        mockHallDAO.findById.mockResolvedValue(null); // invalid
        mockMenuDAO.findById.mockResolvedValue(mockMenu);

        await expect(booking.validateRequiredEntities())
            .rejects
            .toThrow("Hall record not found in database.");
    });
});
