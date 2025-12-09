#!/usr/bin/env node
/**
 * Arrested Development Bluesky Bot
 * Simple, single-file bot that posts video clips to Bluesky
 */

import { AtpAgent } from "@atproto/api";
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const DATABASE_PATH = "./clips_database.json";
const CLIPS_FOLDER = "./clips";

// Types
interface Clip {
  id: string;
  filename: string;
  quote: string;
  character: string;
  description?: string;
  posted: boolean;
  post_date?: string;
}

interface Database {
  clips: Clip[];
}

/**
 * Load the clips database
 */
function loadDatabase(): Database {
  if (!existsSync(DATABASE_PATH)) {
    console.error(`Error: Database file not found at ${DATABASE_PATH}`);
    process.exit(1);
  }

  const data = readFileSync(DATABASE_PATH, "utf-8");
  return JSON.parse(data) as Database;
}

/**
 * Save the clips database
 */
function saveDatabase(db: Database): void {
  writeFileSync(DATABASE_PATH, JSON.stringify(db, null, 2));
}

/**
 * Get the next unposted clip
 */
function getNextClip(db: Database): Clip | null {
  return db.clips.find((clip) => !clip.posted) ?? null;
}

/**
 * Mark a clip as posted
 */
function markAsPosted(db: Database, clipId: Clip["id"]): void {
  const clip = db.clips.find((c) => c.id === clipId);
  if (clip) {
    clip.posted = true;
    clip.post_date = new Date().toISOString();
  }
}

/**
 * Post a clip to Bluesky
 */
async function postClip(clip: Clip): Promise<void> {
  // Initialize Bluesky agent
  const agent = new AtpAgent({ service: "https://bsky.social" });

  // Login
  console.log(`\nLogging in as ${process.env.BLUESKY_USERNAME}...`);
  await agent.login({
    // Non-null assertions are safe here because we validate in main()
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_APP_PASSWORD!,
  });

  // Check if video file exists
  const videoPath = `${CLIPS_FOLDER}/${clip.filename}`;
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Read and upload video
  console.log(`Uploading video: ${clip.filename}...`);
  const videoData = readFileSync(videoPath);
  const { data } = await agent.uploadBlob(videoData, { encoding: "video/mp4" });

  // Create caption
  const caption = `"${clip.quote}"\n\n— ${clip.character}`;

  // Post to Bluesky
  console.log("Posting to Bluesky...");
  await agent.post({
    text: caption,
    embed: {
      $type: "app.bsky.embed.video",
      video: data.blob,
      alt: clip.description || "",
    },
    createdAt: new Date().toISOString(),
  });

  console.log(`✓ Posted: ${clip.id}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Check environment variables
    if (!process.env.BLUESKY_USERNAME || !process.env.BLUESKY_APP_PASSWORD) {
      console.error(
        "Error: Missing BLUESKY_USERNAME or BLUESKY_APP_PASSWORD in .env file"
      );
      process.exit(1);
    }

    // Load database
    console.log("Loading clip database...");
    const db = loadDatabase();

    // Show stats
    const total = db.clips.length;
    const posted = db.clips.filter((c) => c.posted).length;
    console.log(`\nDatabase: ${posted}/${total} clips posted`);

    // Get next clip
    const clip = getNextClip(db);
    if (!clip) {
      console.log("\n✓ All clips have been posted!");
      return;
    }

    // Show what we're posting
    console.log(`\nNext clip:`);
    console.log(`  ${clip.character}: "${clip.quote}"`);
    console.log(`  File: ${clip.filename}`);

    // Post it
    await postClip(clip);

    // Mark as posted and save
    markAsPosted(db, clip.id);
    saveDatabase(db);
    console.log("✓ Database updated\n");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`\n✗ Error: ${error.message}`);
    } else {
      console.error(`\n✗ Error: ${String(error)}`);
    }
    process.exit(1);
  }
}

// Run the bot
main();
