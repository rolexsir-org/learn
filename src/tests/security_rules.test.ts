import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const [host, portText] = emulatorHost?.split(':') ?? [];
const port = Number(portText);

// These are genuine emulator rules tests. They are skipped (not passed as
// placeholders) unless the Firestore Emulator is explicitly available.
describe.skipIf(!emulatorHost)('Firestore security rules (Firestore Emulator required)', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const rules = await readFile(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'learn-rules-test',
      firestore: { host, port, rules },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  it('allows an account to create and read its own profile', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const profile = {
      userId: 'alice',
      displayName: 'Little Explorer',
      totalStars: 0,
      coins: 0,
      currentStreak: 0,
    };
    await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), profile));
    await assertSucceeds(getDoc(doc(aliceDb, 'users/alice')));
  });

  it('denies cross-account profile reads and unfiltered profile collection queries', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertSucceeds(setDoc(doc(bobDb, 'users/bob'), {
      userId: 'bob',
      displayName: 'Private learner',
      totalStars: 12,
      coins: 4,
      currentStreak: 2,
    }));

    await assertFails(getDoc(doc(aliceDb, 'users/bob')));
    await assertFails(getDocs(collection(aliceDb, 'users')));
  });

  it('denies profile identity spoofing', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(aliceDb, 'users/bob'), {
      userId: 'bob',
      displayName: 'Spoofed learner',
      totalStars: 0,
      coins: 0,
      currentStreak: 0,
    }));
  });
});
