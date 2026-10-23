import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password.ts";
import { CLIENT_LIMITS, GLOBAL_LIMITS, lockedFor, registerAttempt, type ThrottleState } from "./throttle-policy.ts";

const FAST = { N: 1_024, r: 8, p: 1 };

test("scrypt hashes verify only the right password and never embed it", async () => {
  const hash = await hashPassword("correct horse battery", FAST);
  assert.ok(hash.startsWith("scrypt:1024:8:1:"));
  assert.ok(!hash.includes("correct"));
  assert.ok(!hash.includes("$"), "a $ would be expanded by Next's .env loader");
  assert.equal(await verifyPassword("correct horse battery", hash), true);
  assert.equal(await verifyPassword("correct horse batterY", hash), false);
  assert.equal(await verifyPassword("", hash), false);
  assert.equal(await verifyPassword("x".repeat(201), hash), false);
  assert.notEqual(await hashPassword("correct horse battery", FAST), hash, "salts must differ");
});

test("malformed or tampered hashes are rejected", async () => {
  const hash = await hashPassword("another password", FAST);
  assert.equal(await verifyPassword("another password", hash.replace("scrypt", "bcrypt")), false);
  assert.equal(await verifyPassword("another password", "scrypt:99999999:8:1:aa:bb"), false);
  assert.equal(await verifyPassword("another password", hash.slice(0, -4)), false);
});

test("five attempts per window, then exponentially longer locks", () => {
  let state: ThrottleState | null = null;
  const start = 1_000_000;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    state = registerAttempt(state, start + attempt, CLIENT_LIMITS);
    assert.equal(lockedFor(state, start + attempt), 0, `attempt ${attempt} should be allowed`);
  }
  state = registerAttempt(state, start + 5, CLIENT_LIMITS);
  const firstLock = lockedFor(state, start + 5);
  assert.equal(firstLock, CLIENT_LIMITS.baseLockMs);

  // After the lock expires another five attempts earn a doubled lock.
  let now = state.lockedUntil + 1;
  for (let attempt = 0; attempt < 5; attempt += 1) state = registerAttempt(state, now + attempt, CLIENT_LIMITS);
  now += 4;
  assert.equal(lockedFor(state, now), CLIENT_LIMITS.baseLockMs * 2);

  // Locks never exceed the maximum.
  for (let round = 0; round < 20; round += 1) {
    now = state.lockedUntil + 1;
    for (let attempt = 0; attempt < 5; attempt += 1) state = registerAttempt(state, now, CLIENT_LIMITS);
  }
  assert.ok(lockedFor(state, now) <= CLIENT_LIMITS.maxLockMs);
});

test("attempt counters reset after a quiet window", () => {
  let state: ThrottleState | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) state = registerAttempt(state, attempt, CLIENT_LIMITS);
  state = registerAttempt(state, CLIENT_LIMITS.windowMs + 10, CLIENT_LIMITS);
  assert.equal(state.attempts, 1);
  assert.equal(lockedFor(state, CLIENT_LIMITS.windowMs + 10), 0);
});

test("the global limit caps distributed guessing", () => {
  let state: ThrottleState | null = null;
  for (let attempt = 0; attempt < GLOBAL_LIMITS.maxAttempts; attempt += 1) state = registerAttempt(state, attempt, GLOBAL_LIMITS);
  assert.ok(lockedFor(state, GLOBAL_LIMITS.maxAttempts) > 0);
});
