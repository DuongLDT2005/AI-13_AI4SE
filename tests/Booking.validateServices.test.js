import Booking from '../src/booking.js'; // adjust path as needed
import { jest } from '@jest/globals';
describe('Booking.validateServices()', () => {
    let booking;
    let allServices;

    beforeEach(() => {
        booking = new Booking();

        // Static list of available services
        allServices = [
            { serviceID: 1, name: 'Service 1' },
            { serviceID: 2, name: 'Service 2' },
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1️⃣ All services valid
    it('✅ should resolve when all selected services are valid', async () => {
        booking.services = [
            { serviceID: 1, quantity: 2 },
            { serviceID: 2, quantity: 1 },
        ];

        await expect(booking.validateServices(allServices)).resolves.toBeUndefined();
    });

    // 2️⃣ Empty services array
    it('✅ should resolve when services array is empty', async () => {
        booking.services = [];

        await expect(booking.validateServices(allServices)).resolves.toBeUndefined();
    });

    // 3️⃣ this.services undefined
    it('❌ should throw when services is undefined', async () => {
        booking.services = undefined;

        await expect(booking.validateServices(allServices))
            .rejects
            .toThrow('Services must be an array.');
    });

    // 4️⃣ this.services not an array
    it('❌ should throw when services is not an array', async () => {
        booking.services = "invalid";

        await expect(booking.validateServices(allServices))
            .rejects
            .toThrow('Services must be an array.');
    });

    // 5️⃣ Service quantity = 0
    it('❌ should throw when a service has quantity 0', async () => {
        booking.services = [
            { serviceID: 1, quantity: 0 }
        ];

        await expect(booking.validateServices(allServices))
            .rejects
            .toThrow('Quantity for service ID 1 must be positive number.');
    });

    // 6️⃣ Service quantity negative
    it('❌ should throw when a service has negative quantity', async () => {
        booking.services = [
            { serviceID: 1, quantity: -2 }
        ];

        await expect(booking.validateServices(allServices))
            .rejects
            .toThrow('Quantity for service ID 1 must be positive number.');
    });

    // 7️⃣ Service quantity not a number
    it('❌ should throw when a service quantity is not a number', async () => {
        booking.services = [
            { serviceID: 1, quantity: "3" }
        ];

        await expect(booking.validateServices(allServices))
            .rejects
            .toThrow('Quantity for service ID 1 must be positive number.');
    });

    // 8️⃣ Service not in database
    it('❌ should throw when a service is not in database', async () => {
        booking.services = [
            { serviceID: 99, quantity: 1 }
        ];

        await expect(booking.validateServices(allServices))
            .rejects
            .toThrow('Service ID 99 not found in database.');
    });
});