# Setup Backup - OAA Project
**Date:** 2026-04-13  
**User:** Valhein (@Javajaze)  
**Assistant:** Legenda xxx

## Project Overview
- **OAA-Project**: Web3 + Auto Affiliate
- **Goal**: Bot auto airdrop hunter + Auto content creator
- **Status**: Fresh install, tools setup complete

## Installed Skills

### 1. Blockchain & Wallet
```bash
cd /root/.openclaw/workspace
clawhub install evm-wallet
```
- **Purpose**: Multi-chain EVM wallet (Base, Ethereum, Polygon, Arbitrum, Optimism)
- **Location**: `/root/.openclaw/workspace/skills/evm-wallet`
- **Key file**: `~/.evm-wallet.json` (private key, chmod 600)

### 2. Token/Memory Optimizers
```bash
clawhub install openclaw-token-save --force
clawhub install context-budgeting
clawhub install memory-tiering
clawhub install elite-longterm-memory --force
```
- **Purpose**: Hemat token untuk bot 24/7
- **Note**: 2 skills flagged suspicious, installed with --force

### 3. Content & Social Media
```bash
clawhub install social-media-scheduler
clawhub install x-post-automation --force
clawhub install linkedin-automation
clawhub install seo
clawhub install blog-master --force
clawhub install automated-content-machine --force
```
- **Purpose**: Auto posting, content generation, SEO
- **Note**: 3 skills flagged suspicious, installed with --force

### 4. Security Tools
```bash
clawhub install security-audit-toolkit
clawhub install ssh-essentials
clawhub install firewall
clawhub install host-hardening
```
- **Purpose**: VPS security, hardening, monitoring
- **Built-in**: healthcheck skill (already available)

### 5. Facebook & Social Media
```bash
clawhub install facebook-page-manager --force
clawhub install facebook
clawhub install meta-business-suite --force
clawhub install upload-post
```
- **Purpose**: Facebook automation, multi-platform posting
- **Note**: 2 skills flagged suspicious, installed with --force

### 6. E-commerce & Shopee Tools
```bash
clawhub install shopee-big-data-analytics
clawhub install ecommerce-scraper --force
clawhub install ecommerce-product-research
clawhub install ai-data-scraper --force
clawhub install unsplash
```
- **Purpose**: Auto riset produk Shopee, scrape data, download gambar
- **Note**: 2 skills flagged suspicious, installed with --force

## Total Skills: 27 installed + 1 built-in

### 7. API Key Rotation Tools
```bash
clawhub install keyswap --force
clawhub install api-rate-limiting
clawhub install agentkeys
```
- **Purpose**: API key rotation, rate limit handling
- **Custom scripts**: Smart rotation strategy
- **Note**: 1 skill flagged suspicious, installed with --force

## Known Issues

### VPS Login Blocked
**Problem:** SSH login denied after giving OpenClaw full access

**Root Cause:**
- Multiple failed SSH login attempts
- Fail2ban blocked IP automatically
- Had to reinstall VPS

**Planned Solution:**
1. Setup SSH key authentication (no password)
2. Disable password authentication in `/etc/ssh/sshd_config`
3. Whitelist IP in fail2ban config
4. Increase fail2ban threshold (maxretry)

**Status:** Not implemented yet, waiting for backup completion

## Configuration Files

### OpenClaw Workspace
- **Location**: `/root/.openclaw/workspace`
- **Skills**: `/root/.openclaw/workspace/skills/`
- **Memory**: `/root/.openclaw/workspace/memory/`

### Important Files
- `USER.md` - User preferences & context
- `IDENTITY.md` - Assistant identity
- `SOUL.md` - Assistant personality
- `TOOLS.md` - Local tool notes
- `MEMORY.md` - Long-term memory (main session only)
- `memory/2026-04-13.md` - Daily log

### Affiliate Strategy Files
- `STRATEGI-FACEBOOK-AFFILIATE.md` - Strategi lengkap 4 fase
- `PRODUK-RISET-20.md` - 20 produk trending Shopee
- `SETUP-FACEBOOK-PAGE.md` - Panduan setup Facebook Page
- `KONTEN-BATCH-1.md` - 10 post ready-to-use

### API Key Rotation Files
- `API-KEY-ROTATION-GUIDE.md` - Panduan lengkap rotation
- `API-ROTATION-INTEGRATION.md` - Integration dengan OpenClaw
- `SMART-ROTATION-SETUP.md` - Smart rotation strategy
- `openrouter-rotator.js` - Node.js rotator (advanced)
- `get-current-key.sh` - Get current active key
- `rotate-key.sh` - Rotate to next key
- `smart-rotation-strategy.sh` - Smart rotation logic
- `track-request.sh` - Track API requests
- `api-keys.json` - 10 OpenRouter API keys (⚠️ SENSITIVE)
- `api-state.json` - State tracking

## Restore Instructions

If you need to restore this setup on a fresh VPS:

```bash
# 1. Install OpenClaw
npm install -g openclaw

# 2. Start gateway
openclaw gateway start

# 3. Restore workspace files
# Copy USER.md, IDENTITY.md, SOUL.md, TOOLS.md, MEMORY.md

# 4. Reinstall skills (run each command)
cd /root/.openclaw/workspace

# Blockchain
clawhub install evm-wallet

# Optimizers
clawhub install openclaw-token-save --force
clawhub install context-budgeting
clawhub install memory-tiering
clawhub install elite-longterm-memory --force

# Content & Social
clawhub install social-media-scheduler
clawhub install x-post-automation --force
clawhub install linkedin-automation
clawhub install seo
clawhub install blog-master --force
clawhub install automated-content-machine --force

# Security
clawhub install security-audit-toolkit
clawhub install ssh-essentials
clawhub install firewall
clawhub install host-hardening

# Facebook & Social Media
clawhub install facebook-page-manager --force
clawhub install facebook
clawhub install meta-business-suite --force
clawhub install upload-post

# E-commerce & Shopee
clawhub install shopee-big-data-analytics
clawhub install ecommerce-scraper --force
clawhub install ecommerce-product-research
clawhub install ai-data-scraper --force
clawhub install unsplash

# API Key Rotation
clawhub install keyswap --force
clawhub install api-rate-limiting
clawhub install agentkeys

# 5. Setup SSH key authentication (IMPORTANT!)
ssh-keygen -t ed25519 -C "openclaw-vps"
# Then disable password auth in sshd_config

# 6. Configure fail2ban whitelist
# Add your IP to /etc/fail2ban/jail.local
```

## Next Steps
1. ✅ Backup complete (updated with 27 skills + API rotation)
2. ✅ Strategi Facebook Affiliate dibuat
3. ✅ Riset 20 produk Shopee selesai
4. ✅ Generate 10 konten batch pertama
5. ✅ API Key Rotation setup (10 keys, smart strategy)
6. ⏳ Setup cron for smart rotation
7. ⏳ Setup Facebook Page (manual)
8. ⏳ Join Shopee Affiliate Program
9. ⏳ Implement SSH key authentication
10. ⏳ Test security configuration
11. ⏳ Setup wallet (evm-wallet)
12. ⏳ Build airdrop bot

---
**Backup created:** 2026-04-13 17:51 GMT+2  
**Last updated:** 2026-04-13 19:14 GMT+2  
**Latest backup:** openclaw-full-backup-20260413-1914.tar.gz (29KB)
