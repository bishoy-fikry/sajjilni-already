import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCalendarSnapshot,
  dayInfo,
  fromCoptic,
  formatGregorianDate,
  parseGregorianDate,
  toCoptic,
  upcomingFeasts,
} from './dualCalendarEngine';

test('converts the requested reference day to 11 Babeh 1743', () => {
  const info = dayInfo('2026-10-21');
  assert.equal(info.coptic, '11 بابه 1743');
});

test('round-trips Gregorian dates through the Coptic calendar', () => {
  for (const dateText of ['1900-01-01', '2026-10-21', '2099-12-31']) {
    const gregorian = parseGregorianDate(dateText);
    const coptic = toCoptic(gregorian);
    assert.equal(formatGregorianDate(fromCoptic(coptic.year, coptic.month, coptic.day)), dateText);
  }
});

test('rejects dates outside the supported Gregorian range and invalid Coptic days', () => {
  assert.throws(() => parseGregorianDate('1899-12-31'), RangeError);
  assert.throws(() => parseGregorianDate('2100-01-01'), RangeError);
  assert.throws(() => parseGregorianDate('2026-02-30'), RangeError);
  assert.throws(() => fromCoptic(1743, 13, 7), RangeError);
});

test('creates a three-feast snapshot with the Cairo-local calendar date', () => {
  const snapshot = createCalendarSnapshot(new Date('2026-10-20T23:00:00.000Z'));
  assert.equal(snapshot.gregorian, '2026-10-21');
  assert.equal(snapshot.coptic, '11 بابه 1743');
  assert.equal(snapshot.upcomingFeasts.length, 3);
  assert.equal(snapshot.note.includes('المقر البابوي'), true);
});

test('stays inside the supported Gregorian range when listing late-2099 events', () => {
  const snapshot = createCalendarSnapshot(new Date('2099-12-31T10:00:00.000Z'));
  assert.equal(snapshot.gregorian, '2099-12-31');
  assert.equal(upcomingFeasts('2099-12-31', 3).every((feast) => feast.date.startsWith('2099-')), true);
});
