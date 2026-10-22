import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import {
  AUTH_COOKIE_NAME,
  createLoginSession,
  getAuthSession,
  setAuthCookie,
  stageForSession,
} from './auth';

const TEST_ENV = {
  SESSION_SECRET: 'test-only-session-signing-secret-longer-than-32-bytes',
  SERVANT_ACCESS_CODE: 'test-only-servant-code',
  SUPERVISOR_ACCESS_CODE: 'test-only-supervisor-code',
  OWNER_ACCESS_CODE: 'test-only-owner-code',
};

function withTestEnvironment<T>(run: () => T): T {
  const original = Object.fromEntries(
    Object.keys(TEST_ENV).map((key) => [key, process.env[key]])
  );
  Object.assign(process.env, TEST_ENV);
  try {
    return run();
  } finally {
    for (const key of Object.keys(TEST_ENV)) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('server verifies a role code and issues a signed session without personal data', () => {
  withTestEnvironment(() => {
    const login = createLoginSession({
      passcode: TEST_ENV.SERVANT_ACCESS_CODE,
      requestedRole: 'servant',
      stageId: 'ss_kg',
      category: 'deacons',
    });
    assert.equal(login.ok, true);
    if (!login.ok) return;
    assert.equal(login.session.role, 'servant');
    assert.equal(login.session.assignedStageId, 'ss_kg');
    assert.equal(login.session.assignedCategory, 'sunday_school');
    assert.equal(stageForSession(login.session, 'ss_kg')?.ageGroup, '3 - 5 سنوات');
    assert.equal(stageForSession(login.session, 'ss_prep_1'), null);

    let cookieValue = '';
    const response = {
      cookie: (_name: string, value: string) => {
        cookieValue = value;
      },
    } as unknown as Response;
    setAuthCookie(response, login.session);

    const [encodedPayload] = cookieValue.split('.');
    const decodedPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    assert.deepEqual(
      Object.keys(decodedPayload).sort(),
      ['assignedCategory', 'assignedStageId', 'expiresAt', 'issuedAt', 'role', 'sessionId'].sort()
    );

    const request = {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(cookieValue)}` },
    } as Request;
    assert.deepEqual(getAuthSession(request), login.session);

    const tamperedRequest = {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(`${cookieValue}x`)}` },
    } as Request;
    assert.equal(getAuthSession(tamperedRequest), null);
  });
});

test('invalid access codes are rejected and owner sessions are limited to the admin role', () => {
  withTestEnvironment(() => {
    const invalid = createLoginSession({
      passcode: 'wrong-test-code',
      requestedRole: 'servant',
      stageId: 'ss_kg',
      category: 'sunday_school',
    });
    assert.deepEqual(invalid, { ok: false, status: 401, error: 'invalid_login' });

    const owner = createLoginSession({
      passcode: TEST_ENV.OWNER_ACCESS_CODE,
      requestedRole: 'servant',
      stageId: 'ss_kg',
      category: 'deacons',
    });
    assert.equal(owner.ok, true);
    if (!owner.ok) return;
    assert.equal(owner.session.role, 'general_admin');
    assert.equal(owner.session.assignedStageId, 'all');
    assert.equal(owner.session.assignedCategory, 'deacons');
  });
});
