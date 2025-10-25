import Booking from '../src/booking';
import { addHours, addYears } from 'date-fns';

describe('Booking.validateEventDate()', () => {
  let booking;
  const systemSettings = {
    DEFAULT_MIN_BOOKING_NOTICE_HOURS: 24, // truyền trực tiếp vào hàm!
  };

  beforeEach(() => {
    booking = new Booking({});
  });

  it('throws if eventDate is missing or not a string', async () => {
    booking.eventDate = null;
    await expect(booking.validateEventDate(systemSettings))
      .rejects
      .toThrow("eventDate must be a valid date string");
  });

  it('throws if eventDate is not valid ISO string', async () => {
    booking.eventDate = 'invalid-date';
    await expect(booking.validateEventDate(systemSettings))
      .rejects
      .toThrow("eventDate must be a valid date string");
  });

  it('throws if eventDate is too soon (less than min notice)', async () => {
    const now = new Date();
    const tooSoon = addHours(now, 10).toISOString().split('T')[0];
    booking.eventDate = tooSoon;

    await expect(booking.validateEventDate(systemSettings, now))
      .rejects
      .toThrow(`Event date must be at least ${systemSettings.DEFAULT_MIN_BOOKING_NOTICE_HOURS} hours from now.`);
  });

  it('throws if eventDate is more than 1 year ahead', async () => {
    const now = new Date();
    const over1Year = addYears(now, 1);
    over1Year.setDate(over1Year.getDate() + 1);
    booking.eventDate = over1Year.toISOString().split('T')[0];

    await expect(booking.validateEventDate(systemSettings, now))
      .rejects
      .toThrow("Event date cannot be more than 1 year in advance.");
  });

  it('passes if eventDate is valid and within allowed range', async () => {
    const now = new Date();
    const validDate = addHours(now, 48).toISOString().split('T')[0];
    booking.eventDate = validDate;

    await expect(booking.validateEventDate(systemSettings, now))
      .resolves.not.toThrow();
  });
});
