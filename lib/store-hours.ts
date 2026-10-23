const STORE_TIME_ZONE = "America/Mexico_City";

const weekdayNumber: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export type StoreHoursStatus = {
  isOpen: boolean;
  localTime: string;
  hoursToday: string;
};

export function getStoreHoursStatus(date: Date = new Date()): StoreHoursStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = weekdayNumber[values.weekday];
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  const openingHour = weekday === 0 ? 8 : 7;
  const closingHour = weekday === 0 ? 14 : 19;
  const localTime = new Intl.DateTimeFormat("es-MX", {
    timeZone: STORE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return {
    isOpen: (weekday !== 0 || openingHour === 8) && (hour * 60 + minute) >= openingHour * 60 && (hour * 60 + minute) < closingHour * 60,
    localTime,
    hoursToday: weekday === 0 ? "08:00–14:00" : "07:00–19:00",
  };
}

function localDateTimeToUtc(year: number, month: number, day: number) {
  const utcGuess = Date.UTC(year, month - 1, day);
  const zonedParts = Object.fromEntries(dateTimeFormatter.formatToParts(new Date(utcGuess)).map((part) => [part.type, part.value]));
  const zonedAsUtc = Date.UTC(
    Number(zonedParts.year),
    Number(zonedParts.month) - 1,
    Number(zonedParts.day),
    Number(zonedParts.hour),
    Number(zonedParts.minute),
    Number(zonedParts.second),
  );

  return new Date(utcGuess - (zonedAsUtc - utcGuess));
}

export function getStoreDayRange(date: Date = new Date()) {
  const parts = Object.fromEntries(dateTimeFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  return {
    start: localDateTimeToUtc(year, month, day),
    end: localDateTimeToUtc(year, month, day + 1),
  };
}