# Prompt Logs
## Prompt 1
### Input Prompt
"Analyze this Booking class and identify all functions that need unit testing: 
[Booking.js] 
For each function, identify:
1. Main functionality
2. Input parameters and types
3. Expected return values
4. Potential edge cases
5. Dependencies that need mocking
Respond using concise bullet points for each function, covering all key details."
### Output Prompt
"Here’s a **comprehensive, concise unit-test analysis** of each function in the `Booking` class:

#### 🧩 **1. validateRequiredEntities({ customer, eventType, hall, menu })**
**Functionality:**
Ensures all required foreign key entities exist and have valid IDs.
**Inputs:**
* `customer`, `eventType`, `hall`, `menu` → objects (each should contain an `ID` field).
**Returns:**
* `void` (throws `Error` on invalid/missing entities).
**Edge Cases:**
* Missing or `null` entity object.
* Missing `ID` field (`customerID`, `hallID`, etc.).
**Dependencies to mock:**
* None (pure logic, no external calls).

#### 🧩 **2. validateHall(hall)**
**Functionality:**
Checks if booking’s `tableCount` is within hall’s min–max limits.
**Inputs:**
* `hall`: object `{ minTable: number, maxTable: number }`.
**Returns:**
* `void` (throws `Error` if invalid).
**Edge Cases:**
* `tableCount` < `minTable` or > `maxTable`.
* Missing hall properties.
**Dependencies to mock:**
* None.

#### 🧩 **3. validateEventDate(systemSettings)**
**Functionality:**
Verifies event date is valid, within allowed time range (≥ min notice hours and ≤ 1 year).
**Inputs:**
* `systemSettings`: object `{ DEFAULT_MIN_BOOKING_NOTICE_HOURS?: string|number }`.
**Returns:**
* `void` (throws `Error` if date invalid or out of range).
**Edge Cases:**
* `eventDate` not in ISO format.
* `eventDate` before current + minNoticeHours.
* `eventDate` > 1 year ahead.
* Invalid or missing `systemSettings`.
**Dependencies to mock:**
* `date-fns`: `addHours`, `addYears`, `parseISO`, `isBefore`.
* `Date.now()` (mock system time).

#### 🧩 **4. validateTimeSlot(isHallAvailable)**
**Functionality:**
Ensures time slot is valid and hall is available.
**Inputs:**
* `isHallAvailable`: boolean.
**Returns:**
* `void` (throws `Error` if invalid slot or unavailable).
**Edge Cases:**
* Missing `startTime` or `endTime`.
* Invalid time slot not matching predefined slots.
* `isHallAvailable = false`.
**Dependencies to mock:**
* None.

#### 🧩 **5. validateDishes(dishesInMenu)**
**Functionality:**
Validates selected dishes exist in menu and meet category rules.
**Inputs:**
* `dishesInMenu`: array of dish objects `{ dishID, categoryID, requiredQuantity? }`.
**Returns:**
* `void` (throws `Error` if missing/invalid dishes).
**Edge Cases:**
* Empty or missing `this.dishes`.
* Dish ID not in menu.
* Category missing required dish count.
**Dependencies to mock:**
* `validateDishCategories` (can spy/mock to isolate logic).

#### 🧩 **6. validateDishCategories(dishesInMenu)**
**Functionality:**
Ensures per-category minimum dish requirements are satisfied.
**Inputs:**
* `dishesInMenu`: array as above.
**Returns:**
* `void` (throws `Error` if category requirement unmet).
**Edge Cases:**
* Category with requiredQuantity > selected dishes.
* Dish not found in menu.
**Dependencies to mock:**
* None.

#### 🧩 **7. validateServices(allServices)**
**Functionality:**
Validates selected services exist and have valid quantities.
**Inputs:**
* `allServices`: array of service objects `{ serviceID, price?, ... }`.
**Returns:**
* `void` (throws `Error` for missing/invalid services).
**Edge Cases:**
* Invalid `serviceID`.
* `quantity <= 0`.
* Empty service list.
**Dependencies to mock:**
* None.

#### 🧩 **8. calculateBasePrice(hall, menu)**
**Functionality:**
Calculates base price = hall.price + (menu.price × tableCount).
**Inputs:**
* `hall`: `{ price: number }`
* `menu`: `{ price: number }`
**Returns:**
* Updates `this.originalPrice`.
**Edge Cases:**
* Missing hall or menu price.
* `tableCount` = 0 or negative.
**Dependencies to mock:**
* None.

#### 🧩 **9. applyPromotions(promotions)**
**Functionality:**
Applies promotions → updates discounts or free services.
**Inputs:**
* `promotions`: array of promo objects `{ discountType, discountValue, minTable?, freeServiceID? }`.
**Returns:**
* Updates `discountAmount`, `promotions`, and private `#freeServices`.
**Edge Cases:**
* Empty promotion list.
* `discountType` invalid.
* `tableCount` below `minTable`.
* Multiple overlapping promotions.
**Dependencies to mock:**
* None (internal logic only).

#### 🧩 **10. applyPaidServices(allServices)**
**Functionality:**
Adds paid service costs to `originalPrice`, ensuring no free duplicates.
**Inputs:**
* `allServices`: array of `{ serviceID, price }`.
**Returns:**
* Updates `services` and `originalPrice`.
**Edge Cases:**
* Service marked as free (in `#freeServices`).
* Missing service info in `allServices`.
* Invalid quantity or price.
**Dependencies to mock:**
* Access to private `#freeServices` (mock indirectly by calling `applyPromotions`).

#### 🧩 **11. calculateTotals(systemSettings)**
**Functionality:**
Computes final totals after discounts and VAT.
**Inputs:**
* `systemSettings`: `{ VAT_RATE?: string|number }`.
**Returns:**
* Updates `VAT` and `totalAmount`.
**Edge Cases:**
* Missing VAT rate (defaults to 0.08).
* Negative total after discount.
* Large monetary values.
**Dependencies to mock:**
* None (math-only logic).

✅ **Summary of Test Coverage**

| Category           | Functions                                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Validation**     | `validateRequiredEntities`, `validateHall`, `validateEventDate`, `validateTimeSlot`, `validateDishes`, `validateDishCategories`, `validateServices` |
| **Calculation**    | `calculateBasePrice`, `applyPromotions`, `applyPaidServices`, `calculateTotals`                                                                     |
| **Mocking needed** | `date-fns` (date logic), `Date.now()`, and optional spies for private sets or sub-validation calls                                                  |

---

Would you like me to generate a **unit test plan table** (with test cases, expected results, and mock setup) for all these functions next?
"