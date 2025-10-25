import Booking from "../src/booking.js";
import { jest } from "@jest/globals";
describe('Booking.validateDishes()', () => {
    let booking;
    let dishesInMenu;

    beforeEach(() => {
        booking = new Booking();

        // Default test data: dishes available in menu
        dishesInMenu = [
            { dishID: 1, category: 'Appetizer' },
            { dishID: 2, category: 'Main' },
            { dishID: 3, category: 'Dessert' },
        ];

        // Mock validateDishCategories to isolate this function
        booking.validateDishCategories = jest.fn().mockResolvedValue(true);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // 1️⃣ All selected dishes exist in menu
    it('✅ should resolve when all selected dishes exist in the menu', async () => {
        booking.dishes = [1, 2, 3];

        await expect(
            booking.validateDishes(dishesInMenu)
        ).resolves.toBeUndefined();

        expect(booking.validateDishCategories).toHaveBeenCalledTimes(1);
        expect(booking.validateDishCategories).toHaveBeenCalledWith(dishesInMenu);
    });

    // 2️⃣ Single dish selection (minimum valid)
    it('✅ should resolve when a single valid dish is selected', async () => {
        booking.dishes = [2];

        await expect(
            booking.validateDishes(dishesInMenu)
        ).resolves.toBeUndefined();

        expect(booking.validateDishCategories).toHaveBeenCalledTimes(1);
    });

    // 3️⃣ Empty dishes array
    it('❌ should throw an error when dishes array is empty', async () => {
        booking.dishes = [];

        await expect(
            booking.validateDishes(dishesInMenu)
        ).rejects.toThrow('At least one dish must be selected.');

        expect(booking.validateDishCategories).not.toHaveBeenCalled();
    });

    // 4️⃣ Dishes is undefined
    it('❌ should throw an error when dishes is undefined', async () => {
        booking.dishes = undefined;

        await expect(
            booking.validateDishes(dishesInMenu)
        ).rejects.toThrow('At least one dish must be selected.');

        expect(booking.validateDishCategories).not.toHaveBeenCalled();
    });

    // 5️⃣ Dishes is not an array (string)
    it('❌ should throw an error when dishes is not an array', async () => {
        booking.dishes = 'invalid';

        await expect(
            booking.validateDishes(dishesInMenu)
        ).rejects.toThrow('At least one dish must be selected.');

        expect(booking.validateDishCategories).not.toHaveBeenCalled();
    });

    // 6️⃣ Contains dish not in menu
    it('❌ should throw an error when a selected dish is not in the menu', async () => {
        booking.dishes = [1, 2, 99]; // 99 not found

        await expect(
            booking.validateDishes(dishesInMenu)
        ).rejects.toThrow('Dish ID 99 not found in menu.');

        expect(booking.validateDishCategories).not.toHaveBeenCalled();
    });

    // 7️⃣ Valid dishes but validateDishCategories fails internally
    it('❌ should throw when validateDishCategories fails internally', async () => {
        booking.dishes = [1, 2];
        booking.validateDishCategories.mockRejectedValue(
            new Error('Category validation failed')
        );

        await expect(
            booking.validateDishes(dishesInMenu)
        ).rejects.toThrow('Category validation failed');

        expect(booking.validateDishCategories).toHaveBeenCalledTimes(1);
    });
});
