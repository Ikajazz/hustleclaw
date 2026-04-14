# Telegram Group Cleanup Guide

**Goal:** Clean up spam, drama, dead groups from Telegram

---

## Method 1: Manual (Fastest)

### Quick Cleanup Steps:

**1. Identify Spam Groups**
Look for keywords in group names:
- Judol: slot, gacor, maxwin, jackpot
- Drama: gosip, berantem, toxic
- Scam: investasi cepat, untung besar

**2. Delete Process**
1. Open Telegram
2. Long press on group
3. Tap "Delete and Exit"
4. Confirm

**3. Bulk Delete**
- Swipe left on multiple groups
- Tap delete on each
- Takes 5-10 minutes for 50+ groups

---

## Method 2: Analyzer Script (Recommended)

### Setup:

**1. Install Telegram skill (when rate limit reset):**
```bash
cd /root/.openclaw/workspace
clawhub install telegram
```

**2. Get Telegram API credentials:**
- Go to https://my.telegram.org/apps
- Create new application
- Get API ID and API Hash

**3. Configure:**
```bash
export TELEGRAM_API_ID="your_api_id"
export TELEGRAM_API_HASH="your_api_hash"
export TELEGRAM_PHONE="+62xxx"
```

**4. Run analyzer:**
```bash
node /root/.openclaw/workspace/telegram-cleanup-analyzer.js
```

### Output Example:

```
╔════════════════════════════════════════════════════════╗
║     Telegram Group Cleanup Report                     ║
╚════════════════════════════════════════════════════════╝

Total Groups: 50
To Delete: 25
To Keep: 15
To Review: 10

🗑️  RECOMMENDED TO DELETE:

1. Slot Gacor Maxwin 🎰
   Category: spam
   Reason: Spam keywords detected
   Score: 25

2. Drama Artis Indonesia
   Category: spam
   Reason: Spam keywords detected
   Score: 20

3. Old School Friends
   Category: dead
   Reason: No activity for 90+ days
   Score: 25

✅ RECOMMENDED TO KEEP:

1. HustleClaw Community
   Reason: Active and productive

2. Web3 Indonesia
   Reason: Active and productive

⚠️  REVIEW MANUALLY:

1. Family Group
   Reason: Neutral
```

---

## Cleanup Criteria

### DELETE if:
- ✅ Spam keywords in name (judol, slot, drama)
- ✅ No activity 30+ days
- ✅ 100+ messages/day (too noisy)
- ✅ Scam/promo heavy
- ✅ Toxic/drama content

### KEEP if:
- ✅ Business/networking value
- ✅ Active but not spam (20-100 msg/day)
- ✅ Learning/educational
- ✅ Project-related (HustleClaw, etc)
- ✅ Close friends/family

### REVIEW if:
- ⚠️ Inactive but might be useful later
- ⚠️ Moderate activity
- ⚠️ Unsure about value

---

## Spam Keywords Database

### Judol (Judi Online):
- slot, gacor, maxwin, jackpot, deposit
- scatter, rtp, pragmatic, pg soft
- bonus, withdraw, menang

### Drama:
- drama, gosip, berantem, ribut, toxic
- haters, cancel, exposed

### Scam:
- investasi cepat, untung besar, passive income mudah
- daftar sekarang, klik link, promo terbatas
- jangan sampai ketinggalan, buruan

### Spam:
- forward, share, viral, wajib baca
- limited, exclusive, secret

---

## Automation (Future)

### Auto-leave spam groups:
```javascript
// Pseudo-code
if (group.name.includes(SPAM_KEYWORDS)) {
  telegram.leaveGroup(group.id);
  log(`Left spam group: ${group.name}`);
}
```

### Monitor new groups:
```javascript
// Auto-analyze when added to new group
telegram.on('group_added', (group) => {
  const analysis = analyzeGroup(group);
  if (analysis.category === 'SPAM') {
    telegram.leaveGroup(group.id);
  }
});
```

---

## Best Practices

**1. Regular Cleanup**
- Monthly review
- Delete dead groups immediately
- Archive instead of delete if unsure

**2. Prevention**
- Don't join random groups
- Leave immediately if spam detected
- Mute noisy groups instead of delete

**3. Organization**
- Pin important groups
- Use folders (Business, Personal, Projects)
- Archive inactive but valuable groups

**4. Focus**
- Keep only groups that add value
- Quality > Quantity
- Mental clarity > FOMO

---

## Quick Commands

### List all groups:
```bash
# Via Telegram CLI (if installed)
telegram-cli -e "dialog_list"
```

### Export group list:
```bash
# Via Telegram Desktop
Settings → Advanced → Export Telegram Data → Chats
```

---

## Estimated Time

- **Manual cleanup (50 groups):** 10-15 minutes
- **With analyzer script:** 5 minutes + review
- **Maintenance (monthly):** 5 minutes

---

## Results

**Before:**
- 100+ groups
- Constant notifications
- Distracted
- Overwhelmed

**After:**
- 20-30 productive groups
- Focused notifications
- Clear mind
- Better productivity

---

**Status:** Ready to use
**Recommendation:** Start with manual cleanup today, setup analyzer later
