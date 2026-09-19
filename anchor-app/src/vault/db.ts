/**
 * ANCHOR — Encrypted IndexedDB
 * ==============================
 * Local database layer. Uses `idb` to wrap IndexedDB in Promises.
 * Everything except the salt is stored as AES-GCM encrypted blobs.
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { encryptData, decryptData } from './crypto';

import type { SupportResponse } from '../brain/contracts';

// The types of data we store in plain text before encryption
export interface CheckInEntry {
  id: string;
  timestamp: number;
  mood: string;
  triggerCategory?: string;
  note?: string;
  ragResponse?: SupportResponse;
}

export interface GoalEntry {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  completed: boolean;
}

// The database schema
interface AnchorDB extends DBSchema {
  // Unencrypted metadata (salt, setup status)
  meta: {
    key: string;
    value: any;
  };
  // Encrypted check-ins and journal entries
  entries: {
    key: string;
    value: {
      id: string;
      timestamp: number;
      payload: Uint8Array; // The AES-GCM encrypted CheckInEntry
    };
    indexes: { 'by-timestamp': number };
  };
  // Encrypted goals
  goals: {
    key: string;
    value: {
      id: string;
      timestamp: number;
      payload: Uint8Array; // The AES-GCM encrypted GoalEntry
    };
    indexes: { 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<AnchorDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AnchorDB>('anchor-vault', 1, {
      upgrade(db) {
        db.createObjectStore('meta');
        
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('by-timestamp', 'timestamp');

        const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
        goalStore.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

// ─── Metadata ─────────────────────────────────────────────────────────

export async function getSalt(): Promise<Uint8Array | null> {
  const db = await getDB();
  return (await db.get('meta', 'salt')) as Uint8Array | null;
}

export async function setSalt(salt: Uint8Array): Promise<void> {
  const db = await getDB();
  await db.put('meta', salt, 'salt');
}

export async function isSetupComplete(): Promise<boolean> {
  const db = await getDB();
  const setup = await db.get('meta', 'setup_complete');
  return !!setup;
}

export async function markSetupComplete(): Promise<void> {
  const db = await getDB();
  await db.put('meta', true, 'setup_complete');
}

// ─── Entries (Check-ins & Journals) ───────────────────────────────────

export async function saveEntry(entry: CheckInEntry, key: CryptoKey): Promise<void> {
  const db = await getDB();
  const payload = await encryptData(entry, key);
  
  await db.put('entries', {
    id: entry.id,
    timestamp: entry.timestamp,
    payload,
  });
}

export async function getEntries(key: CryptoKey): Promise<CheckInEntry[]> {
  const db = await getDB();
  // Get all from the index sorted by timestamp
  const rows = await db.getAllFromIndex('entries', 'by-timestamp');
  
  const entries: CheckInEntry[] = [];
  for (const row of rows) {
    try {
      const entry = await decryptData<CheckInEntry>(row.payload, key);
      entries.push(entry);
    } catch (err) {
      console.error('Failed to decrypt entry:', row.id, err);
      // Skip decryption failures (could be key mismatch if something broke)
    }
  }
  
  // Return descending (newest first)
  return entries.reverse();
}

// ─── Goals ────────────────────────────────────────────────────────────

export async function saveGoal(goal: GoalEntry, key: CryptoKey): Promise<void> {
  const db = await getDB();
  const payload = await encryptData(goal, key);
  
  await db.put('goals', {
    id: goal.id,
    timestamp: goal.timestamp,
    payload,
  });
}

export async function getGoals(key: CryptoKey): Promise<GoalEntry[]> {
  const db = await getDB();
  const rows = await db.getAllFromIndex('goals', 'by-timestamp');
  
  const goals: GoalEntry[] = [];
  for (const row of rows) {
    try {
      const goal = await decryptData<GoalEntry>(row.payload, key);
      goals.push(goal);
    } catch (err) {
      console.error('Failed to decrypt goal:', row.id, err);
    }
  }
  
  return goals.reverse();
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('goals', id);
}

// ─── Crypto Shredding ─────────────────────────────────────────────────

/**
 * Crypto-shredding: We delete the database entirely.
 * Because the encryption key was only in memory, once the DB is deleted,
 * all data is permanently inaccessible even if somehow recovered from disk.
 */
export async function cryptoShred(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  
  // Delete the databases
  await window.indexedDB.deleteDatabase('anchor-vault');
  
  // We should also clear any other data like the transformers cache if we can,
  // but for the hackathon this is sufficient for user data.
}

export async function seedMockData(key: CryptoKey): Promise<void> {
  const db = await getDB();
  const mockEntries: CheckInEntry[] = [
    {
      id: crypto.randomUUID(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
      mood: 'good',
      triggerCategory: 'Social pressure',
      note: 'Went to the party. Felt a bit anxious at first but stayed grounded.',
      ragResponse: {
        text: 'It is wonderful that you practiced grounding in a stressful situation. Acknowledging the anxiety without letting it overwhelm you is a huge step.',
        source: 'Anchor AI',
        excerpt: '',
        crisis: false
      }
    },
    {
      id: crypto.randomUUID(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
      mood: 'low',
      triggerCategory: 'Stress or overwhelm',
      note: 'Work was incredibly demanding today. Felt completely drained and had some cravings.',
      ragResponse: {
        text: 'Stress is a very common trigger. Remember to take things one hour at a time and try the 4-7-8 breathing when the overwhelm hits.',
        source: 'Anchor AI',
        excerpt: '',
        crisis: false
      }
    },
    {
      id: crypto.randomUUID(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
      mood: 'okay',
      triggerCategory: 'Stress or overwhelm',
      note: 'Managing better today, but the background stress is still there.',
      ragResponse: {
        text: 'Consistency is key. You are doing well by just noticing the background stress and naming it.',
        source: 'Anchor AI',
        excerpt: '',
        crisis: false
      }
    },
    {
      id: crypto.randomUUID(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
      mood: 'low',
      triggerCategory: 'Financial worry',
      note: 'Looked at the bills and panicked a little.',
      ragResponse: {
        text: 'Financial worries can trigger deep anxiety. Focus on what you can control right now in this exact moment.',
        source: 'Anchor AI',
        excerpt: '',
        crisis: false
      }
    },
    {
      id: crypto.randomUUID(),
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
      mood: 'great',
      triggerCategory: 'Social pressure',
      note: 'Hung out with friends who don\'t drink. Felt incredibly freeing and safe.',
      ragResponse: {
        text: 'Building a safe environment and spending time with supportive people is one of the best things you can do for your recovery.',
        source: 'Anchor AI',
        excerpt: '',
        crisis: false
      }
    }
  ];

  for (const entry of mockEntries) {
    await saveEntry(entry, key);
  }
}

