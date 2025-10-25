import Booking from '../src/booking.js'; // adjust import path if needed
import {jest} from '@jest/globals';

describe('Booking.validateDishCategories()', () => {
    let booking;
    let dishesInMenu;

    beforeEach(() => {
        booking = new Booking();

        // Default menu data
        dishesInMenu = [
            { dishID: 1, requiredQuantity: 1 },
            { dishID: 2, requiredQuantity: 1 },
            { dishID: 3, requiredQuantity: 1 },
            { dishID: 4, requiredQuantity: 2 }, // For single category multiple requirement
        ];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1️⃣ All categories satisfied
    it('✅ should resolve when all categories are satisfied', async () => {
        booking.dishes = [1, 2, 3];

        await expect(
            booking.validateDishCategories(dishesInMenu)
        ).resolves.toBeUndefined();
    });

    // 2️⃣ Single category, exact required quantity
    it('✅ should resolve for single category with exact required quantity', async () => {
        booking.dishes = [4, 4]; // two dishes for category with requiredQuantity = 2

        await expect(
            booking.validateDishCategories(dishesInMenu)
        ).resolves.toBeUndefined();
    });

    // 3️⃣ Extra dishes beyond required
    it('✅ should resolve when extra dishes beyond required are selected', async () => {
        booking.dishes = [1, 2, 3, 4, 4]; // more than required in category 4

        await expect(
            booking.validateDishCategories(dishesInMenu)
        ).resolves.toBeUndefined();
    });

    // 4️⃣ Duplicate dish selection in same category
    it('✅ should count duplicates towards category requirement', async () => {
        booking.dishes = [4, 4]; // satisfies category 4 with duplicate

        await expect(
            booking.validateDishCategories(dishesInMenu)
        ).resolves.toBeUndefined();
    });

});