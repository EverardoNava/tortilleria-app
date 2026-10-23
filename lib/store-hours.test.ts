import { getStoreDayRange, getStoreHoursStatus } from "@/lib/store-hours";

describe("getStoreHoursStatus", () => {
  it("opens at 7:00 and closes before 19:00 on weekdays", () => {
    expect(getStoreHoursStatus(new Date("2026-10-12T13:00:00.000Z")).isOpen).toBe(true);
    expect(getStoreHoursStatus(new Date("2026-10-12T12:59:00.000Z")).isOpen).toBe(false);
    expect(getStoreHoursStatus(new Date("2026-10-13T01:00:00.000Z")).isOpen).toBe(false);
  });

  it("uses Sunday hours from 8:00 to 14:00 in Mexico City", () => {
    expect(getStoreHoursStatus(new Date("2026-10-11T14:00:00.000Z")).isOpen).toBe(true);
    expect(getStoreHoursStatus(new Date("2026-10-11T20:00:00.000Z")).isOpen).toBe(false);
  });

  it("uses midnight boundaries in Mexico City for the daily report", () => {
    const range = getStoreDayRange(new Date("2026-10-12T13:00:00.000Z"));

    expect(range.start.toISOString()).toBe("2026-10-12T06:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-13T06:00:00.000Z");
  });
});