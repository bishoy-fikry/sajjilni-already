import fixedFeastsJson from '../data/feasts.json';

export const COPTIC_MONTHS = [
  'توت',
  'بابه',
  'هاتور',
  'كيهك',
  'طوبة',
  'أمشير',
  'برمهات',
  'برمودة',
  'بشنس',
  'بؤونة',
  'أبيب',
  'مسرى',
  'النسيء',
] as const;

const WEEKDAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

type FixedFeast = {
  month: number;
  day: number;
  name: string;
  kind: string;
};

export type CopticDate = {
  year: number;
  month: number;
  day: number;
};

export type CalendarEvent = {
  name: string;
  kind: string;
};

export type CalendarDayInfo = {
  gregorian: string;
  weekday: string;
  coptic: string;
  fasts: string[];
  events: CalendarEvent[];
};

export type UpcomingFeast = {
  date: string;
  weekday: string;
  coptic: string;
  name: string;
  kind: string;
  daysAway: number;
};

export type CalendarSnapshot = CalendarDayInfo & {
  upcomingFeasts: UpcomingFeast[];
  note: string;
};

const FIXED_FEASTS = fixedFeastsJson as FixedFeast[];
const DAY_MS = 24 * 60 * 60 * 1000;

function assertGregorianYear(year: number): void {
  if (!Number.isInteger(year) || year < 1900 || year > 2099) {
    throw new RangeError('Calendar conversions support Gregorian years 1900–2099.');
  }
}

function dateUtc(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

function normalizeUtcDate(date: Date): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('A valid date is required.');
  }
  const year = date.getUTCFullYear();
  assertGregorianYear(year);
  return dateUtc(year, date.getUTCMonth(), date.getUTCDate());
}

export function parseGregorianDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new TypeError('Date must use YYYY-MM-DD format.');
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  assertGregorianYear(year);
  const date = dateUtc(year, Number(monthText) - 1, Number(dayText));
  if (formatGregorianDate(date) !== value) throw new RangeError('Invalid Gregorian date.');
  return date;
}

export function formatGregorianDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/**
 * 1 توت is September 11, or September 12 when the following Gregorian year is leap.
 * The function permits adjacent years internally so end-of-range snapshots can
 * calculate events that fall just after December 2099.
 */
export function copticNewYear(gregorianYear: number): Date {
  if (!Number.isInteger(gregorianYear) || gregorianYear < 1899 || gregorianYear > 2100) {
    throw new RangeError('Coptic new-year calculation is limited to 1899–2100.');
  }
  return dateUtc(gregorianYear, 8, isGregorianLeapYear(gregorianYear + 1) ? 12 : 11);
}

export function toCoptic(dateInput: Date): CopticDate {
  const date = normalizeUtcDate(dateInput);
  const gregorianYear = date.getUTCFullYear();
  let newYear = copticNewYear(gregorianYear);
  let copticYear = gregorianYear - 283;

  if (date.getTime() < newYear.getTime()) {
    newYear = copticNewYear(gregorianYear - 1);
    copticYear = gregorianYear - 284;
  }

  const elapsedDays = Math.round((date.getTime() - newYear.getTime()) / DAY_MS);
  return {
    year: copticYear,
    month: Math.floor(elapsedDays / 30) + 1,
    day: (elapsedDays % 30) + 1,
  };
}

export function fromCoptic(copticYear: number, month: number, day: number): Date {
  if (!Number.isInteger(copticYear)) throw new TypeError('Coptic year must be an integer.');
  if (!Number.isInteger(month) || month < 1 || month > 13) {
    throw new RangeError('Coptic month must be between 1 and 13.');
  }
  const gregorianYear = copticYear + 283;
  if (gregorianYear < 1899 || gregorianYear > 2099) {
    throw new RangeError('Calendar conversions support Gregorian years 1900–2099.');
  }

  const start = copticNewYear(gregorianYear);
  const nextStart = copticNewYear(gregorianYear + 1);
  const lastMonthLength = Math.round((nextStart.getTime() - start.getTime()) / DAY_MS) - 360;
  const monthLength = month === 13 ? lastMonthLength : 30;
  if (!Number.isInteger(day) || day < 1 || day > monthLength) {
    throw new RangeError(`Day must be between 1 and ${monthLength} for this Coptic month.`);
  }

  const result = new Date(start.getTime() + ((month - 1) * 30 + day - 1) * DAY_MS);
  assertGregorianYear(result.getUTCFullYear());
  return result;
}

export function formatCopticDate(date: Date): string {
  const { year, month, day } = toCoptic(date);
  return `${day} ${COPTIC_MONTHS[month - 1]} ${year}`;
}

export function copticEaster(gregorianYear: number): Date {
  assertGregorianYear(gregorianYear);
  const a = gregorianYear % 4;
  const b = gregorianYear % 7;
  const c = gregorianYear % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const n = d + e + 114;
  const julianMonth = Math.floor(n / 31);
  const julianDay = (n % 31) + 1;
  const julianDate = dateUtc(gregorianYear, julianMonth - 1, julianDay);
  return new Date(julianDate.getTime() + 13 * DAY_MS);
}

type MovableDates = {
  ninevehStart: Date;
  ninevehEnd: Date;
  ninevehFeast: Date;
  lentPrepStart: Date;
  lentStart: Date;
  lazarusSaturday: Date;
  palmSunday: Date;
  covenantThursday: Date;
  goodFriday: Date;
  holySaturday: Date;
  easter: Date;
  thomasSunday: Date;
  ascension: Date;
  pentecost: Date;
  apostlesFastStart: Date;
};

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function movableFeasts(gregorianYear: number): MovableDates {
  const easter = copticEaster(gregorianYear);
  return {
    ninevehStart: addDays(easter, -69),
    ninevehEnd: addDays(easter, -67),
    ninevehFeast: addDays(easter, -66),
    lentPrepStart: addDays(easter, -55),
    lentStart: addDays(easter, -48),
    lazarusSaturday: addDays(easter, -8),
    palmSunday: addDays(easter, -7),
    covenantThursday: addDays(easter, -3),
    goodFriday: addDays(easter, -2),
    holySaturday: addDays(easter, -1),
    easter,
    thomasSunday: addDays(easter, 7),
    ascension: addDays(easter, 39),
    pentecost: addDays(easter, 49),
    apostlesFastStart: addDays(easter, 50),
  };
}

function sameDay(left: Date, right: Date): boolean {
  return left.getTime() === right.getTime();
}

function dateIsBetween(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function fastsOn(date: Date): string[] {
  const fasts: string[] = [];
  const { month, day } = toCoptic(date);
  const movable = movableFeasts(date.getUTCFullYear());
  const isoDate = date.getTime();

  if (dateIsBetween(date, movable.ninevehStart, movable.ninevehEnd)) {
    fasts.push('صوم يونان (نينوى) — انقطاعي');
  }
  if (isoDate >= movable.lentPrepStart.getTime() && isoDate < movable.lentStart.getTime()) {
    fasts.push('أسبوع الاستعداد للصوم الكبير');
  }
  if (isoDate >= movable.lentStart.getTime() && isoDate < movable.palmSunday.getTime()) {
    fasts.push('الصوم الكبير');
  }
  if (isoDate >= movable.palmSunday.getTime() && isoDate < movable.easter.getTime()) {
    fasts.push('أسبوع الآلام');
  }

  const apostlesFastEnd = dateUtc(date.getUTCFullYear(), 6, 11);
  if (isoDate >= movable.apostlesFastStart.getTime() && isoDate <= apostlesFastEnd.getTime()) {
    fasts.push('صوم الرسل');
  }
  if (month === 12 && day >= 1 && day <= 15) {
    fasts.push('صوم السيدة العذراء');
  }
  if ((month === 3 && day >= 16) || (month === 4 && day <= 28)) {
    fasts.push('صوم الميلاد');
  }
  if (month === 4 && day === 28) {
    fasts.push('برامون الميلاد — انقطاعي');
  }
  if (month === 5 && day === 10) {
    fasts.push('برامون الغطاس — انقطاعي');
  }

  const inPentecost = dateIsBetween(date, movable.easter, movable.pentecost);
  const weekday = date.getUTCDay();
  if ((weekday === 3 || weekday === 5) && !inPentecost && fasts.length === 0) {
    fasts.push('صوم الأربعاء والجمعة');
  }

  return fasts;
}

function eventsOn(date: Date): CalendarEvent[] {
  const { month, day } = toCoptic(date);
  const movable = movableFeasts(date.getUTCFullYear());
  const labels: [keyof MovableDates, string][] = [
    ['ninevehFeast', 'عيد نينوى'],
    ['lazarusSaturday', 'سبت لعازر'],
    ['palmSunday', 'أحد الشعانين'],
    ['covenantThursday', 'خميس العهد'],
    ['goodFriday', 'الجمعة العظيمة'],
    ['holySaturday', 'سبت الفرح (سبت النور)'],
    ['easter', 'عيد القيامة المجيد'],
    ['thomasSunday', 'أحد توما'],
    ['ascension', 'عيد الصعود'],
    ['pentecost', 'عيد حلول الروح القدس (العنصرة)'],
    ['lentStart', 'بداية الصوم الكبير'],
    ['ninevehStart', 'بداية صوم يونان'],
    ['lentPrepStart', 'بداية أسبوع الاستعداد'],
    ['apostlesFastStart', 'بداية صوم الرسل'],
  ];

  const events: CalendarEvent[] = labels
    .filter(([key]) => sameDay(movable[key], date))
    .map(([, name]) => ({ name, kind: 'movable' }));

  for (const feast of FIXED_FEASTS) {
    if (feast.month === month && feast.day === day) {
      events.push({ name: feast.name, kind: feast.kind });
    }
  }

  if (events.length === 0) {
    const monthlyRemembrances: Record<number, string> = {
      12: 'تذكار رئيس الملائكة ميخائيل',
      21: 'تذكار السيدة العذراء',
      29: 'تذكار شهري',
    };
    if (monthlyRemembrances[day] && !(month === 4 && day === 29)) {
      events.push({ name: monthlyRemembrances[day], kind: 'monthly' });
    }
  }

  return events;
}

export function dayInfo(dateInput: Date | string): CalendarDayInfo {
  const date = typeof dateInput === 'string' ? parseGregorianDate(dateInput) : normalizeUtcDate(dateInput);
  return {
    gregorian: formatGregorianDate(date),
    weekday: WEEKDAYS[date.getUTCDay()],
    coptic: formatCopticDate(date),
    fasts: fastsOn(date),
    events: eventsOn(date),
  };
}

export function upcomingFeasts(startInput: Date | string, count = 3): UpcomingFeast[] {
  if (!Number.isInteger(count) || count < 0 || count > 20) {
    throw new RangeError('Upcoming event count must be between 0 and 20.');
  }
  const start = typeof startInput === 'string' ? parseGregorianDate(startInput) : normalizeUtcDate(startInput);
  const eligibleKinds = new Set(['feast', 'major_lord', 'minor_lord', 'movable']);
  const upcoming: UpcomingFeast[] = [];

  for (let offset = 0; offset <= 370 && upcoming.length < count; offset += 1) {
    const date = addDays(start, offset);
    if (date.getUTCFullYear() > 2099) break;
    const info = dayInfo(date);
    for (const event of info.events) {
      if (!eligibleKinds.has(event.kind)) continue;
      upcoming.push({
        date: info.gregorian,
        weekday: info.weekday,
        coptic: info.coptic,
        name: event.name,
        kind: event.kind,
        daysAway: offset,
      });
      if (upcoming.length >= count) break;
    }
  }

  return upcoming;
}

function cairoToday(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const year = part('year');
  const month = part('month');
  const day = part('day');
  if (!year || !month || !day) throw new Error('Could not resolve Cairo-local date.');
  return `${year}-${month}-${day}`;
}

export function createCalendarSnapshot(now = new Date()): CalendarSnapshot {
  const date = cairoToday(now);
  return {
    ...dayInfo(date),
    upcomingFeasts: upcomingFeasts(date, 3),
    note: 'التواريخ محسوبة آلياً؛ الإعلان الرسمي من المقر البابوي هو المرجع النهائي.',
  };
}
