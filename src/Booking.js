import { isBefore, addHours, addYears, parseISO, formatISO, isValid as isValidDate } from 'date-fns';

/**
 * Enum for booking statuses.
 */
const BookingStatus = Object.freeze({
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2,
    CONFIRMED: 3,
    DEPOSITED: 4,
    EXPIRED: 5,
    CANCELLED: 6,
    COMPLETED: 7,
});

class Booking {
    bookingID;
    customerID;
    eventTypeID;
    hallID;
    menuID;
    eventDate;
    startTime;
    endTime;
    tableCount;
    specialRequest;
    status;
    originalPrice;
    discountAmount;
    VAT;
    totalAmount;
    createdAt;
    isChecked;
    dishes = [];
    services = [];
    promotions = [];
    #freeServices = new Set();
    #vatRate = 0.08;

    constructor({
        bookingID,
        customerID,
        eventTypeID,
        hallID,
        menuID,
        eventDate,
        startTime,
        endTime,
        tableCount = 1,
        specialRequest = "",
        status = BookingStatus.PENDING,
        originalPrice = 0,
        discountAmount = 0,
        VAT = 0,
        totalAmount = 0,
        createdAt = new Date(),
        isChecked = false,
        dishes = [],
        services = [],
        promotions = [],
        // ---------------- INJECTED DAOS ---------------- 
        customerDAO,
        eventTypeDAO,
        hallDAO,
        menuDAO, } = {}) {
        Object.assign(this, {
            bookingID,
            customerID,
            eventTypeID,
            hallID,
            menuID,
            eventDate,
            startTime,
            endTime,
            tableCount,
            specialRequest,
            status,
            originalPrice,
            discountAmount,
            VAT,
            totalAmount,
            createdAt,
            isChecked,
            dishes,
            services,
            promotions,
            customerDAO,
            eventTypeDAO,
            hallDAO,
            menuDAO,
        });
    }
    _addFreeServiceForTest(id) { this.#freeServices.add(id); }
    getFreeServicesForTest() { return this.#freeServices; }
    //#region VALIDATION
    // ---------------- VALIDATION ----------------


    async validateRequiredEntities() {
        const customer = await this.customerDAO.findById(this.customerID);
        const eventType = await this.eventTypeDAO.findById(this.eventTypeID);
        const hall = await this.hallDAO.findById(this.hallID);
        const menu = await this.menuDAO.findById(this.menuID);

        if (!customer) throw new Error("Customer record not found in database.");
        if (!eventType) throw new Error("Event type record not found in database.");
        if (!hall) throw new Error("Hall record not found in database.");
        if (!menu) throw new Error("Menu record not found in database.");
    }

    async validateHall() {
        if (typeof this.tableCount !== 'number' || isNaN(this.tableCount))
            throw new Error("Table count is missing or invalid.");

        const hall = await this.hallDAO.findById(this.hallID);
        if (!hall) throw new Error("Hall not found for validation.");

        if (this.tableCount < hall.minTable || this.tableCount > hall.maxTable)
            throw new Error(
                `Table count (${this.tableCount}) must be between ${hall.minTable} and ${hall.maxTable}.`
            );
    }

    async validateEventDate(systemSettings, now = new Date()) {
        const minNoticeHours = parseInt(systemSettings.DEFAULT_MIN_BOOKING_NOTICE_HOURS || '24', 10);
        if (isNaN(minNoticeHours) || minNoticeHours < 0)
            throw new Error("Invalid system min notice hours.");

        const minBookingDate = addHours(now, minNoticeHours);
        const maxBookingDate = addYears(now, 1);

        // 1. Có eventDate và là string
        if (!this.eventDate || typeof this.eventDate !== 'string')
            throw new Error("eventDate must be a valid date string (e.g., YYYY-MM-DD).");

        // 2. Parse đúng ISO date
        const parsed = parseISO(this.eventDate);
        if (!isValidDate(parsed))
            throw new Error("eventDate must be a valid date string (e.g., YYYY-MM-DD).");

        // 3. Kiểm tra thời gian tối thiểu
        if (parsed.getTime() < minBookingDate.getTime() - 1000)
            throw new Error(`Event date must be at least ${minNoticeHours} hours from now.`);

        // 4. Kiểm tra thời gian tối đa (1 năm)
        if (parsed > maxBookingDate)
            throw new Error("Event date cannot be more than 1 year in advance.");
    }


    async validateTimeSlot() {
        const timeSlots = {
            'Buổi trưa': { startTime: '10:30:00', endTime: '14:00:00' },
            'Buổi tối': { startTime: '17:30:00', endTime: '21:00:00' }
        };

        if (!this.startTime || !this.endTime) {
            const slot = timeSlots[this.timeSlot];
            if (!slot) throw new Error('Invalid time slot. Must be "Buổi trưa" or "Buổi tối".');
            this.startTime = slot.startTime;
            this.endTime = slot.endTime;
        } else {
            const isValidFormat = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(this.startTime)
                && /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(this.endTime);
            if (!isValidFormat) throw new Error('startTime/endTime format invalid (HH:mm:ss)');

            const isValid = Object.values(timeSlots).some(
                s => s.startTime === this.startTime && s.endTime === this.endTime
            );
            if (!isValid) throw new Error('startTime/endTime must match a predefined slot.');
        }

        const available = await this.hallDAO.isAvailable(this.hallID, this.eventDate, this.startTime, this.endTime);
        if (!available) throw new Error('The hall is not available for the selected date and time slot.');
    }

    async validateDishes(dishesInMenu) {
        if (!Array.isArray(this.dishes) || this.dishes.length === 0)
            throw new Error("At least one dish must be selected.");

        const dishIDsInMenu = dishesInMenu.map(d => d.dishID);
        for (const id of this.dishes) {
            if (!dishIDsInMenu.includes(id))
                throw new Error(`Dish ID ${id} not found in menu.`);
        }

        await this.validateDishCategories(dishesInMenu);
    }

    async validateDishCategories(dishesInMenu) {
        const requiredByCat = new Map();
        const selectedByCat = new Map();

        for (const dish of dishesInMenu) {
            if (!requiredByCat.has(dish.categoryID))
                requiredByCat.set(dish.categoryID, dish.requiredQuantity || 0);
        }

        for (const id of this.dishes) {
            const dish = dishesInMenu.find(d => d.dishID === id);
            if (dish)
                selectedByCat.set(dish.categoryID, (selectedByCat.get(dish.categoryID) || 0) + 1);
        }

        for (const [catID, req] of requiredByCat.entries()) {
            const count = selectedByCat.get(catID) || 0;
            if (count < req)
                throw new Error(`Category ${catID} requires ${req} dishes, only ${count} selected.`);
        }
    }

    async validateServices(allServices) {
        if (!Array.isArray(this.services)) throw new Error("Services must be an array.");

        const validServiceIDs = new Set(allServices.map(s => s.serviceID));
        for (const s of this.services) {
            if (typeof s.quantity !== 'number' || s.quantity <= 0)
                throw new Error(`Quantity for service ID ${s.serviceID} must be positive number.`);
            if (!validServiceIDs.has(s.serviceID))
                throw new Error(`Service ID ${s.serviceID} not found in database.`);
        }
    }
    //endRegion

    //#region CALCULATION
    // ---------------- CALCULATION ----------------

    async calculateBasePrice(hall, menu) {
        if (typeof hall.price !== 'number' || typeof menu.price !== 'number')
            throw new Error("Hall or menu price must be a number.");
        if (typeof this.tableCount !== 'number') throw new Error("tableCount must be a number.");

        this.originalPrice = hall.price + (menu.price * this.tableCount);
    }

    async applyPromotions(promotions) {
    if (!Array.isArray(promotions)) {
        throw new TypeError("promotions must be an array");
    }

    this.discountAmount = 0;
    this.promotions = [];

    for (const promo of promotions) {
        if (!promo || typeof promo !== "object") continue;

        if (this.tableCount >= (promo.minTable || 0)) {
            if (promo.discountType === 0 && typeof promo.discountValue === "number") {
                this.promotions.push(promo);
                this.discountAmount += this.originalPrice * (promo.discountValue / 100);
            }
            else if (promo.discountType === 1 && promo.freeServiceID) {
                this.promotions.push(promo);
                this.#freeServices.add(promo.freeServiceID);
            }
        }
    }
}

    async applyPaidServices(allServices) {
        const map = new Map(allServices.map(s => [s.serviceID, s]));
        const paid = [];

        for (const s of this.services) {
            if (this.#freeServices.has(s.serviceID))
                throw new Error(`Service ID ${s.serviceID} is already free.`);

            const info = map.get(s.serviceID);
            if (!info) throw new Error(`Service ID ${s.serviceID} not found.`);

            const price = info.price * s.quantity;
            this.originalPrice += price;

            paid.push({ serviceID: s.serviceID, quantity: s.quantity, appliedPrice: price });
        }

        this.services = paid;
    }

    async calculateTotals(systemSettings) {
        this.#vatRate = parseFloat(systemSettings.VAT_RATE || '0.08');
        if (isNaN(this.#vatRate) || this.#vatRate < 0) this.#vatRate = 0.08;

        if (typeof this.originalPrice !== 'number') throw new Error("originalPrice must be a number.");
        if (typeof this.discountAmount !== 'number') throw new Error("discountAmount must be a number.");

        const afterDiscount = this.originalPrice - this.discountAmount;
        this.VAT = afterDiscount * this.#vatRate;
        this.totalAmount = afterDiscount + this.VAT;

        if (this.totalAmount < 0) this.totalAmount = 0;
    }
}

export default Booking;