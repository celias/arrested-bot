# AGENT.md - Implementation Instructions

This document contains the complete, step-by-step instructions for implementing the Arrested Development Bluesky Bot.

## 📋 Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** installed

   - Check: `node --version`
   - Download: https://nodejs.org

2. **A Bluesky account** for your bot

   - Sign up: https://bsky.app
   - Create an app password: Settings → App Passwords → Add App Password
   - **IMPORTANT**: Use app password, NOT your main password

3. **Video clips** from Arrested Development
   - You must create/obtain these yourself
   - 50 clips are defined in the database
   - Each should be 5-10 seconds, MP4 format

## 📁 Project Structure

Create this exact folder structure:

```
bsky-bot/
├── clips/                    # Video files (you create these)
│   ├── banana_stand_money.mp4
│   ├── chicken_dance.mp4
│   └── ... (48 more clips)
├── bot.ts                    # Main bot script (TypeScript, provided)
├── package.json              # Dependencies (provided)
├── clips_database.json       # Clip metadata (provided)
├── .env                      # Your credentials (you create)
└── .gitignore               # Git ignore (provided)
```

## 🔧 Step-by-Step Setup

### Step 1: Create Project Directory

```bash
mkdir bsky-bot
cd bsky-bot
```

### Step 2: Add Provided Files

Copy these 4 files into the project directory:

- `bot.ts`
- `package.json`
- `clips_database.json`
- `gitignore` (rename to `.gitignore`)

### Step 3: Install Dependencies

```bash
npm install
```

This installs the dependencies defined in `package.json`, including:

- Runtime: `@atproto/api`, `dotenv`, `cron`
- Dev tools: `typescript`, `ts-node`, type definitions

**Verification**: Check that `node_modules/` folder was created.

### Step 4: Configure Credentials

Create a `.env` file in the project root:

```bash
# Use the provided env.example as template
cp env.example .env
```

Edit `.env` with your actual credentials:

```env
BLUESKY_USERNAME=yourbot.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**CRITICAL**:

- Use the full handle including `.bsky.social`
- Use an APP PASSWORD, not your main password
- Never commit `.env` to git

### Step 5: Create Clips Folder

```bash
mkdir clips
```

### Step 6: Add Video Clips

You need to create/obtain 50 video clips. The database (`clips_database.json`) defines each clip with:

- `id`: Unique identifier
- `filename`: Exact name for the video file
- `character`: Who says the quote
- `quote`: The memorable line
- `description`: Scene description

**Creating Clips**:

Option A - Manual Extraction:

1. Screen record episodes from legal streaming service
2. Edit to 5-10 seconds using any video editor
3. Export as MP4 (H.264 video, AAC audio)
4. Name exactly as shown in database

Option B - FFmpeg (command line):

```bash
# Trim a clip from a full episode
ffmpeg -i full_episode.mp4 -ss 00:15:23 -t 00:00:08 -c copy clips/banana_stand_money.mp4
```

**Naming Convention**:

- Must match `filename` field in database exactly
- Example: `banana_stand_money.mp4`, `chicken_dance.mp4`
- Case-sensitive on Linux/Mac

**Video Requirements**:

- Format: MP4 (H.264/AAC)
- Duration: 5-10 seconds recommended
- Size: Under 50MB
- Resolution: 720p or 1080p

### Step 7: Test the Bot

Run a test to verify everything works:

```bash
npm start
```

**Expected Output**:

```
Loading clip database...

Database: 0/50 clips posted

Next clip:
  George Sr.: "There's always money in the banana stand"
  File: banana_stand_money.mp4

Logging in as yourbot.bsky.social...
Uploading video: banana_stand_money.mp4...
Posting to Bluesky...
✓ Posted: ad_s01e01_001
✓ Database updated
```

**Verification**:

1. Check your Bluesky profile - the post should appear
2. Check `clips_database.json` - first clip should have `"posted": true`

## 🚀 Deployment Options

Once testing works, choose a deployment method:

### Option A: GitHub Actions (Recommended - Free)

1. Create a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create --private --source=.
git push -u origin main
```

2. Add secrets to GitHub:

   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add `BLUESKY_USERNAME`
   - Add `BLUESKY_APP_PASSWORD`

3. Create `.github/workflows/post.yml`:

```yaml
name: Post Daily Clip
on:
  schedule:
    - cron: "0 15 * * *" # Daily at 3pm UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Post clip
        env:
          BLUESKY_USERNAME: ${{ secrets.BLUESKY_USERNAME }}
          BLUESKY_APP_PASSWORD: ${{ secrets.BLUESKY_APP_PASSWORD }}
        run: npm start

      - name: Commit database changes
        run: |
          git config user.name "Bot"
          git config user.email "bot@example.com"
          git add clips_database.json
          git commit -m "Update posted clips" || echo "No changes"
          git push
```

4. Push to GitHub:

```bash
git add .github/workflows/post.yml
git commit -m "Add GitHub Actions workflow"
git push
```

**Note**: GitHub Actions has storage limits. With 50 clips at ~5MB each, you're at ~250MB. This is within the 1GB repo limit but consider using Git LFS for video files if needed.

### Option B: Local Cron (Linux/Mac)

1. Edit crontab:

```bash
crontab -e
```

2. Add this line (posts daily at 3pm):

```
0 15 * * * cd /full/path/to/bsky-bot && /usr/local/bin/npm start >> /tmp/bot.log 2>&1
```

3. Save and exit

**Verification**:

```bash
# List cron jobs
crontab -l

# Check logs
tail -f /tmp/bot.log
```

### Option C: Cloud Hosting

**Heroku**:

```bash
heroku create your-bot-name
heroku config:set BLUESKY_USERNAME=yourbot.bsky.social
heroku config:set BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
heroku addons:create scheduler:standard
git push heroku main
# Configure scheduler in Heroku dashboard to run: npm start
```

**Railway.app**:

1. Connect GitHub repo
2. Add environment variables in dashboard
3. Add `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔍 Verification Checklist

Before deploying, verify:

- [ ] `npm install` completes without errors
- [ ] `.env` file exists with correct credentials
- [ ] `clips/` folder contains all 50 video files
- [ ] All filenames match database exactly
- [ ] `npm start` successfully posts to Bluesky
- [ ] Posted clip appears on your Bluesky profile
- [ ] Database updates `"posted": true` for posted clip

## 🛠️ Troubleshooting

### "Cannot find module '@atproto/api'"

**Solution**: Run `npm install`

### "Error: Database file not found"

**Solution**: Ensure `clips_database.json` is in project root

### "Error: Video file not found: clips/banana_stand_money.mp4"

**Solution**:

- Check that `clips/` folder exists
- Check filename matches database exactly (case-sensitive)
- Verify file is a valid MP4

### "Error: Authentication failed"

**Solution**:

- Verify you're using an APP PASSWORD, not main password
- Check `.env` has correct username (with .bsky.social)
- Ensure no extra spaces in `.env` file

### "Error: ECONNREFUSED" or network errors

**Solution**:

- Check internet connection
- Bluesky API may be down (check status)
- Try again in a few minutes

### "All clips have been posted"

**Solution**: Edit `clips_database.json` and change `"posted": true` back to `"posted": false` for clips you want to repost.

### GitHub Actions: "Video file not found"

**Solution**:

- Video files must be committed to repository
- Check `.gitignore` isn't excluding `clips/*.mp4`
- May need Git LFS for large files

## 📝 Database Management

### Reset All Clips

To repost all clips, edit `clips_database.json`:

```bash
# Use find/replace in your editor
# Replace: "posted": true
# With: "posted": false
```

### Add New Clips

Edit `clips_database.json` and add:

```json
{
  "id": "ad_s05e03_001",
  "filename": "new_clip.mp4",
  "season": 5,
  "episode": 3,
  "character": "Character Name",
  "quote": "The memorable quote",
  "description": "Scene description",
  "posted": false,
  "post_date": null
}
```

### Manual Posting Order

Clips post in order of `id` field. To change order:

1. Edit the `id` values
2. Keep format: `ad_s##e##_###`

## 🎨 Customization

### Change Caption Format

In `bot.ts`, find the caption line:

```javascript
// Current format
const caption = `"${clip.quote}"\n\n— ${clip.character}`;

// Add episode info
const caption = `"${clip.quote}"\n\n— ${clip.character} (S${clip.season}E${clip.episode})`;

// Add hashtags
const caption = `"${clip.quote}"\n\n— ${clip.character}\n\n#ArrestedDevelopment`;
```

### Change Posting Frequency

Edit cron schedule:

```bash
# Daily at 3pm
0 15 * * *

# Twice daily (9am and 9pm)
0 9,21 * * *

# Every 6 hours
0 */6 * * *

# Every Monday at noon
0 12 * * 1
```

### Add Engagement Tracking

Edit `bot.ts` to add engagement score:

```javascript
// After posting, add:
const postUri = response.uri; // From post response
// Store postUri in database
// Later, fetch post stats and update engagement_score
```

## 🔒 Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use app passwords** - Not your main Bluesky password
3. **Rotate passwords** - If compromised, revoke and create new
4. **Private repository** - Keep GitHub repo private if it contains videos
5. **Secrets management** - Use GitHub Secrets, not hardcoded values

## 📊 Monitoring

### Check Bot Status

```bash
# View last posted clip
cat clips_database.json | grep -A 1 '"posted": true' | tail -2

# Count posted clips
cat clips_database.json | grep -c '"posted": true'

# View cron logs (if using cron)
tail -f /tmp/bot.log
```

### GitHub Actions Monitoring

- Go to repository → Actions tab
- View workflow runs
- Check logs for errors

## ⚖️ Legal Considerations

**Copyright Notice**: Arrested Development is owned by 20th Television.

**Fair Use Guidelines**:

- Keep clips short (5-10 seconds)
- Add commentary/context in captions
- Non-commercial use
- Transformative purpose

**Recommendation**: Consult legal counsel if running a large public bot.

## 🎯 Success Metrics

After deployment, track:

- Posts per day: Should match schedule
- Engagement: Likes, reposts, replies
- Errors: Check logs for failures
- Coverage: All clips posted within X days

## 📞 Support Resources

- **Bluesky API Docs**: https://docs.bsky.app
- **Node.js Docs**: https://nodejs.org/docs
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **FFmpeg Guide**: https://ffmpeg.org/documentation.html

## ✅ Final Checklist

Before going live:

- [ ] All 50 video clips created and named correctly
- [ ] Bot tested locally with `npm start`
- [ ] Credentials secured in `.env` (local) or GitHub Secrets
- [ ] Deployment method chosen and configured
- [ ] First post verified on Bluesky
- [ ] Monitoring/logging set up
- [ ] `.gitignore` properly excludes `.env`
- [ ] Documentation reviewed

---

## 🚀 Quick Start Commands

```bash
# Setup
mkdir bsky-bot && cd bsky-bot
# Copy provided files here
npm install
mkdir clips
# Add your video clips to clips/
cp env.example .env
# Edit .env with credentials

# Test
npm start

# Deploy (choose one)
# Option 1: GitHub Actions (commit and push)
# Option 2: Cron (crontab -e)
# Option 3: Cloud (heroku/railway/fly.io)
```

---

**You're ready to post! There's always money in the banana stand. 🍌**
