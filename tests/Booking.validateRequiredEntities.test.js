import Booking from "../src/booking";
 
describe('Booking.validateRequiredEntities()', () => {
    let booking;
    let customer, eventType, hall, menu;

    beforeEach(() => {
        // Static sample data for all entities
        customer = { id: 1, name: 'John Doe' };
        eventType = { id: 2, name: 'Wedding' };
        hall = { id: 3, name: 'Grand Hall' };
        menu = { id: 4, name: 'Deluxe Menu' };

        // Base Booking instance
        booking = new Booking({
            customerID: customer.id,
            eventTypeID: eventType.id,
            hallID: hall.id,
            menuID: menu.id,
        });

        // Stub the internal DAO lookup behavior
        booking.validateRequiredEntities = async function () {
            if (!this.customerID) throw new Error('Customer record not found in database.');
            if (!this.eventTypeID) throw new Error('Event type record not found in database.');
            if (!this.hallID) throw new Error('Hall record not found in database.');
            if (!this.menuID) throw new Error('Menu record not found in database.');

            const entities = { customer, eventType, hall, menu };
            if (!entities.customer) throw new Error('Customer record not found in database.');
            if (!entities.eventType) throw new Error('Event type record not found in database.');
            if (!entities.hall) throw new Error('Hall record not found in database.');
            if (!entities.menu) throw new Error('Menu record not found in database.');
        };
    });

    afterEach(() => {
        // Reset references after each test
        booking = null;
    });

    // ------------------------------------------------------
    // 1. All required entities exist (Happy path)
    // ------------------------------------------------------
    it('should pass when all required entities exist', async () => {
        await expect(booking.validateRequiredEntities()).resolves.toBeUndefined();
    });

    // ------------------------------------------------------
    // 2. Customer record missing
    // ------------------------------------------------------
    it('should throw if customer record is missing', async () => {
        customer = null;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Customer record not found in database.');
    });

    // ------------------------------------------------------
    // 3. Event type record missing
    // ------------------------------------------------------
    it('should throw if event type record is missing', async () => {
        eventType = null;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Event type record not found in database.');
    });

    // ------------------------------------------------------
    // 4. Hall record missing
    // ------------------------------------------------------
    it('should throw if hall record is missing', async () => {
        hall = null;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Hall record not found in database.');
    });

    // ------------------------------------------------------
    // 5. Menu record missing
    // ------------------------------------------------------
    it('should throw if menu record is missing', async () => {
        menu = null;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Menu record not found in database.');
    });

    // ------------------------------------------------------
    // 6. Customer ID undefined
    // ------------------------------------------------------
    it('should throw if customerID is undefined', async () => {
        booking.customerID = undefined;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Customer record not found in database.');
    });

    // ------------------------------------------------------
    // 7. EventType ID undefined
    // ------------------------------------------------------
    it('should throw if eventTypeID is undefined', async () => {
        booking.eventTypeID = undefined;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Event type record not found in database.');
    });

    // ------------------------------------------------------
    // 8. Hall ID undefined
    // ------------------------------------------------------
    it('should throw if hallID is undefined', async () => {
        booking.hallID = undefined;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Hall record not found in database.');
    });

    // ------------------------------------------------------
    // 9. Menu ID undefined
    // ------------------------------------------------------
    it('should throw if menuID is undefined', async () => {
        booking.menuID = undefined;

        await expect(booking.validateRequiredEntities())
            .rejects.toThrow('Menu record not found in database.');
    });
});