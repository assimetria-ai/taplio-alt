import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = join(__dirname, "data");
const WAITLIST_FILE = join(DATA_DIR, "waitlist.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

// Load waitlist data
async function loadWaitlist() {
  try {
    const data = await readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save waitlist data
async function saveWaitlist(waitlist) {
  await ensureDataDir();
  await writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Add to waitlist
export async function addToWaitlist(email, name = null) {
  // Validate email
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Invalid email format");
  }

  // Validate name if provided
  const normalizedName = name ? name.trim() : null;
  if (normalizedName && normalizedName.length > 100) {
    throw new Error("Name is too long (max 100 characters)");
  }

  // Load current waitlist
  const waitlist = await loadWaitlist();

  // Check if email already exists
  const existing = waitlist.find((entry) => entry.email === normalizedEmail);
  if (existing) {
    return {
      email: existing.email,
      name: existing.name,
      position: existing.position,
      joinedAt: existing.joinedAt,
      alreadyJoined: true,
    };
  }

  // Add new entry
  const position = waitlist.length + 1;
  const newEntry = {
    email: normalizedEmail,
    name: normalizedName,
    position,
    joinedAt: new Date().toISOString(),
    referrals: 0,
  };

  waitlist.push(newEntry);
  await saveWaitlist(waitlist);

  return {
    email: newEntry.email,
    name: newEntry.name,
    position: newEntry.position,
    joinedAt: newEntry.joinedAt,
    alreadyJoined: false,
  };
}

// Get waitlist stats
export async function getWaitlistStats() {
  const waitlist = await loadWaitlist();
  return {
    total: waitlist.length,
    last24h: waitlist.filter((entry) => {
      const joinedAt = new Date(entry.joinedAt);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return joinedAt > dayAgo;
    }).length,
  };
}

// Get position by email
export async function getPosition(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const waitlist = await loadWaitlist();
  const entry = waitlist.find((e) => e.email === normalizedEmail);
  return entry ? entry.position : null;
}
