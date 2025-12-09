# Bluesky Bot Tutorial

This folder contains a starter template for creating a bot on Bluesky. In this example, the bot posts a smiley emoji on an automated schedule once every three hours.

## Set Up

1. Install Node.js on your machine (from https://nodejs.org/ or via your OS package manager). Node is the runtime; it must be installed globally.
2. Install project dependencies locally (recommended):
   - Initialize the project (if needed): `npm init -y`
   - Install development dependencies: `npm install --save-dev typescript ts-node @types/node`
   - (Optional) Install runtime dependencies such as dotenv: `npm install dotenv`
3. Make a copy of the example `.env` file by running: `cp example.env .env`. Set your username and password in `.env`. Use an App Password.
4. Compile your project by running: `npx tsc` or activate watch mode to have your code automatically compile: `npx tsc -w`

## Running the script

1. For development run directly with ts-node: `npx ts-node src/index.ts` (or `npm run dev` if you add a script).
2. For production build and run:
   - Build: `npx tsc` (or `npm run build`)
   - Run: `node dist/index.js`
3. Modify the script however you like to make this bot your own!

## Example package.json scripts

Add these to `package.json` to make common tasks easier:

```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  }
}
```

## Deploying your bot

1. You can deploy a simple bot for free or low cost on a variety of platforms. For example, check out [Heroku](https://devcenter.heroku.com/articles/github-integration) or [Fly.io](https://fly.io/docs[...]

---

# Arrested Development Bluesky Bot

Simple bot that posts Arrested Development video clips to Bluesky. One file, minimal dependencies.

## 📁 What You Need

```
arrested-dev-bot/
├── clips/                       # Put your video files here
│   ├── banana_stand_money.mp4
│   ├── chicken_dance.mp4
│   └── ...
├── bot.js                       # The bot (single file)
├── clips_database.json          # Clip metadata
├── package.json                 # Dependencies
├── .env                         # Your credentials
└── .gitignore                   # Git ignore
```

## 🚀 Quick Setup

### 1. Install Node.js

Download from https://nodejs.org (need version 18+)

### 2. Install dependencies

```bash
npm install
```

This installs only 2 packages:

- `@atproto/api` - Official Bluesky API (well-maintained)
- `dotenv` - Environment variables (very popular)

### 3. Get your clips

Create a `clips/` folder and add your video files:

```bash
mkdir clips
```

The database has 50 clips listed. Name your video files to match (e.g., `banana_stand_money.mp4`).

### 4. Set up Bluesky credentials

Create a `.env` file:

```env
BLUESKY_USERNAME=your-bot.bsky.social
BLUESKY_APP_PASSWORD=your-app-password
```

Get an app password from: Bluesky Settings → App Passwords

### 5. Run the bot

```bash
npm start
```

That's it! The bot will:

- Find the next unposted clip
- Upload it to Bluesky
- Post it with the quote and character name
- Mark it as posted in the database

## 📝 The Database

`clips_database.json` contains 50 Arrested Development moments:

```json
{
  "clips": [
    {
      "id": "ad_s01e01_001",
      "filename": "banana_stand_money.mp4",
      "character": "George Sr.",
      "quote": "There's always money in the banana stand",
      "description": "George Sr. tells Michael about the banana stand",
      "posted": false,
      "post_date": null
    }
  ]
}
```

The bot reads this file, finds the first unposted clip, posts it, and marks `posted: true`.

## 🔄 Scheduling

### Run Daily with Cron (Linux/Mac)

```bash
crontab -e
```

Add this line to post daily at 3pm:

```
0 15 * * * cd /path/to/bot && node bot.js
```

### Run Daily with GitHub Actions

Create `.github/workflows/post.yml`:

```yaml
name: Post Daily
on:
  schedule:
    - cron: "0 15 * * *" # 3pm UTC daily

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: node bot.js
        env:
          BLUESKY_USERNAME: ${{ secrets.BLUESKY_USERNAME }}
          BLUESKY_APP_PASSWORD: ${{ secrets.BLUESKY_APP_PASSWORD }}
      - run: |
          git config user.name "Bot"
          git config user.email "bot@example.com"
          git add clips_database.json
          git commit -m "Update database" || echo "No changes"
          git push
```

Add your credentials to GitHub: Repository Settings → Secrets → Actions

### Run on Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 3pm
4. Action: Start a program
   - Program: `node`
   - Arguments: `C:\path\to\bot\bot.js`
   - Start in: `C:\path\to\bot`

## 🎬 Creating Clips

You need to make the video clips yourself:

1. **Screen record** episodes from Netflix/Hulu (legal streaming services you have access to)
2. **Edit to 5-10 seconds** using any video editor
3. **Export as MP4** (H.264 video, AAC audio)
4. **Name exactly** as shown in database

Use FFmpeg to trim clips:

```bash
ffmpeg -i input.mp4 -ss 00:01:30 -t 00:00:08 -c copy output.mp4
```

## 🛠️ Troubleshooting

**"Cannot find module"**

```bash
npm install
```

**"Video file not found"**

- Check the `clips/` folder exists
- Check filename matches database exactly

**"Authentication failed"**

- Use an **app password**, not your main password
- Check `.env` has correct credentials

**"All clips posted"**

- Edit `clips_database.json`
- Change `"posted": true` back to `"posted": false`

## 📜 Legal Note

Keep clips short (5-10 seconds) for fair use. Arrested Development is owned by 20th Television. Consult legal advice if running a large public bot.

## 🔧 Customization

Edit `bot.js` to change:

- Caption format (line 71)
- Video embed settings (line 76)
- Database location (line 13)

It's a single file - easy to customize!

---

**Simple, clean, and ready to post! 🍌**
