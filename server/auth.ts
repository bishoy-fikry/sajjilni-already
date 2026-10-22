import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler, Response } from 'express';
import { ALL_STAGES, CATEGORIES_CONFIG } from '../src/data/servicesData.ts';
import type { ServiceCategory } from '../src/types';

export type AuthRole = 'servant' | 'stage_supervisor' | 'general_admin';

export type AuthSession = {
  sessionId: string;
  role: AuthRole;
  assignedStageId: string;
  assignedCategory: ServiceCategory;
  issuedAt: number;
  expiresAt: number;
};

declare global {
  namespace Express {
    interface Request {
      authSession?: AuthSession;
    }
  }
}

export const AUTH_COOKIE_NAME = 'sajjilni_session';
export const AUTH_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const SESSION_SECRET_MIN_BYTES = 32;

function sessionSecret(): string | null {
  const value = process.env.SESSION_SECRET;
  if (!value || Buffer.byteLength(value, 'utf8') < SESSION_SECRET_MIN_BYTES) return null;
  return value;
}

function constantTimeMatch(candidate: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const candidateBytes = Buffer.from(candidate, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}

function safeCookieValue(request: Request): string | null {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;
    const name = item.slice(0, separator).trim();
    if (name !== AUTH_COOKIE_NAME) continue;
    try {
      return decodeURIComponent(item.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'servant' || value === 'stage_supervisor' || value === 'general_admin';
}

function isServiceCategory(value: unknown): value is ServiceCategory {
  return CATEGORIES_CONFIG.some((category) => category.id === value);
}

export function createLoginSession(input: {
  passcode: unknown;
  requestedRole: unknown;
  stageId: unknown;
  category: unknown;
}): { ok: true; session: AuthSession } | { ok: false; status: number; error: string } {
  const secret = sessionSecret();
  if (!secret) return { ok: false, status: 503, error: 'login_unavailable' };

  if (
    typeof input.passcode !== 'string' ||
    input.passcode.length < 1 ||
    input.passcode.length > 128 ||
    (input.requestedRole !== 'servant' && input.requestedRole !== 'stage_supervisor')
  ) {
    return { ok: false, status: 400, error: 'invalid_login' };
  }

  const passcode = input.passcode;
  let role: AuthRole;
  let assignedStageId: string;
  let assignedCategory: ServiceCategory;

  if (constantTimeMatch(passcode, process.env.OWNER_ACCESS_CODE)) {
    role = 'general_admin';
    assignedStageId = 'all';
    assignedCategory = isServiceCategory(input.category) ? input.category : 'sunday_school';
  } else if (
    input.requestedRole === 'servant' &&
    constantTimeMatch(passcode, process.env.SERVANT_ACCESS_CODE)
  ) {
    role = 'servant';
    const stage = ALL_STAGES.find((item) => item.id === input.stageId);
    if (!stage) return { ok: false, status: 400, error: 'invalid_login' };
    assignedStageId = stage.id;
    assignedCategory = stage.category;
  } else if (
    input.requestedRole === 'stage_supervisor' &&
    constantTimeMatch(passcode, process.env.SUPERVISOR_ACCESS_CODE)
  ) {
    role = 'stage_supervisor';
    const stage = ALL_STAGES.find((item) => item.id === input.stageId);
    if (!stage) return { ok: false, status: 400, error: 'invalid_login' };
    assignedStageId = stage.id;
    assignedCategory = stage.category;
  } else {
    const configuredForRole =
      input.requestedRole === 'servant'
        ? process.env.SERVANT_ACCESS_CODE
        : process.env.SUPERVISOR_ACCESS_CODE;
    if (!configuredForRole && !process.env.OWNER_ACCESS_CODE) {
      return { ok: false, status: 503, error: 'login_unavailable' };
    }
    return { ok: false, status: 401, error: 'invalid_login' };
  }

  const issuedAt = Date.now();
  return {
    ok: true,
    session: {
      sessionId: randomUUID(),
      role,
      assignedStageId,
      assignedCategory,
      issuedAt,
      expiresAt: issuedAt + AUTH_SESSION_TTL_MS,
    },
  };
}

export function setAuthCookie(response: Response, session: AuthSession): void {
  const secret = sessionSecret();
  if (!secret) throw new Error('Session signing is not configured.');
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const signature = signPayload(payload, secret);
  response.cookie(AUTH_COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: AUTH_SESSION_TTL_MS,
  });
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export function getAuthSession(request: Request): AuthSession | null {
  const secret = sessionSecret();
  const value = safeCookieValue(request);
  if (!secret || !value) return null;

  const separator = value.lastIndexOf('.');
  if (separator <= 0) return null;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expectedSignature = signPayload(payload, secret);
  const suppliedBytes = Buffer.from(signature, 'utf8');
  const expectedBytes = Buffer.from(expectedSignature, 'utf8');
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AuthSession>;
    if (
      typeof parsed.sessionId !== 'string' ||
      !isAuthRole(parsed.role) ||
      typeof parsed.assignedStageId !== 'string' ||
      !isServiceCategory(parsed.assignedCategory) ||
      typeof parsed.issuedAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now() ||
      parsed.issuedAt > Date.now() + 60_000
    ) {
      return null;
    }
    if (parsed.assignedStageId !== 'all' && !ALL_STAGES.some((stage) => stage.id === parsed.assignedStageId)) {
      return null;
    }
    if (parsed.role !== 'general_admin' && parsed.assignedStageId === 'all') return null;
    return parsed as AuthSession;
  } catch {
    return null;
  }
}

export const requireSession: RequestHandler = (request, response, next) => {
  const session = getAuthSession(request);
  if (!session) {
    response.status(401).json({ error: 'session_required' });
    return;
  }
  request.authSession = session;
  next();
};

export const requireGeneralAdmin: RequestHandler = (request, response, next) => {
  if (request.authSession?.role !== 'general_admin') {
    response.status(403).json({ error: 'not_allowed' });
    return;
  }
  next();
};

export function stageForSession(session: AuthSession, requestedStageId?: unknown) {
  if (
    session.role !== 'general_admin' &&
    typeof requestedStageId === 'string' &&
    requestedStageId !== session.assignedStageId
  ) {
    return null;
  }
  const stageId =
    session.role === 'general_admin' && typeof requestedStageId === 'string'
      ? requestedStageId
      : session.assignedStageId;
  if (stageId === 'all') return null;
  const stage = ALL_STAGES.find((item) => item.id === stageId);
  if (!stage) return null;
  if (session.role !== 'general_admin' && stage.id !== session.assignedStageId) return null;
  return stage;
}
