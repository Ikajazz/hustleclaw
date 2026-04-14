# Video Generation Skills - Draft

**For:** HustleClaw content automation
**Purpose:** Auto-generate video content for TikTok, Reels, YouTube Shorts

---

## Top Video Generation Skills

### 1. create-video-ai (Recommended)
**Score:** 2.099 (Highest popularity)

**Features:**
- Generate videos from text prompts
- Edit existing videos with AI
- Multiple styles & templates
- Social media optimized

**Use Cases:**
- Product review videos
- Unboxing simulations
- Comparison videos
- Tutorial/how-to content

**Installation:**
```bash
clawhub install create-video-ai
```

---

### 2. ai-video-builder
**Score:** 1.101

**Features:**
- Complete videos from text
- Auto music integration
- Auto subtitles/captions
- Multiple languages

**Use Cases:**
- Full product presentations
- Explainer videos
- Story-based content
- Educational content

**Installation:**
```bash
clawhub install ai-video-builder
```

---

### 3. ima-ai-video-generator
**Score:** 1.118

**Features:**
- Short & promo videos
- Text to video
- Image to video
- Quick generation

**Use Cases:**
- TikTok/Reels (15-60 sec)
- Product slideshow videos
- Promo clips
- Story highlights

**Installation:**
```bash
clawhub install ima-ai-video-generator
```

---

## Workflow Integration

### Affiliate Video Automation

**Step 1: Product Research**
```
Input: Shopee product URL
Output: Product details, images, specs
```

**Step 2: Script Generation**
```
Input: Product details
Output: Video script (30-60 sec)
Tool: GPT-4 / Claude
```

**Step 3: Video Generation**
```
Input: Script + product images
Output: MP4 video with music & subtitles
Tool: create-video-ai
```

**Step 4: Post to Social Media**
```
Input: Generated video
Output: Posted to TikTok, Reels, YouTube Shorts
Tool: upload-post skill
```

---

## Example Workflow

### Daily Video Campaign

```javascript
// 1. Get trending products
const products = await shopeeResearch.getTrending(20);

// 2. Generate scripts
const scripts = await Promise.all(
  products.map(p => generateScript(p))
);

// 3. Generate videos
const videos = await Promise.all(
  scripts.map(s => createVideo(s))
);

// 4. Schedule posts
await scheduleVideos(videos, {
  tiktok: '08:00, 12:00, 18:00',
  reels: '09:00, 13:00, 19:00',
  shorts: '10:00, 14:00, 20:00'
});
```

---

## Video Templates

### 1. Product Review (30 sec)
```
[0-5s]   Hook: "Produk viral di Shopee!"
[5-15s]  Features: Show 3 key features
[15-25s] Benefits: Why you need this
[25-30s] CTA: "Link di bio!"
```

### 2. Unboxing (60 sec)
```
[0-10s]  Intro: Package arrival
[10-30s] Unboxing: Show product
[30-50s] First impressions
[50-60s] CTA: "Beli sekarang!"
```

### 3. Comparison (45 sec)
```
[0-5s]   Hook: "Mana yang lebih worth it?"
[5-20s]  Product A features
[20-35s] Product B features
[35-45s] Verdict + CTA
```

---

## API Requirements

Most video generation skills require:
- API key (from service provider)
- Credits/quota (free tier available)
- Internet connection
- Storage space (for video files)

**Common providers:**
- Runway ML
- Synthesia
- Pictory
- InVideo
- Lumen5

---

## Cost Estimation

### Free Tier (typical):
- 5-10 videos/month
- 720p resolution
- Watermark included
- Limited templates

### Paid Tier:
- Unlimited videos
- 1080p/4K resolution
- No watermark
- All templates
- Cost: $20-50/month

### For HustleClaw:
- Target: 30 videos/month (1/day)
- Recommendation: Paid tier ($30/month)
- ROI: If 1 video = 10 sales × Rp10k commission = Rp100k
- Break even: 3 videos/month

---

## Performance Metrics

### Expected Results:
- Video engagement: 2-5x higher than static posts
- Conversion rate: 1.5-3x higher
- Reach: 3-10x organic reach
- Time saved: 90% (vs manual video editing)

### Benchmarks:
- Manual video creation: 2-4 hours/video
- AI video generation: 5-10 minutes/video
- Quality: 70-80% of manual (good enough for social media)

---

## Next Steps

1. **Choose skill** (Recommendation: create-video-ai)
2. **Get API key** from provider
3. **Test with 1 product** (proof of concept)
4. **Optimize workflow** (templates, scripts)
5. **Scale to daily automation**

---

## Installation Plan

**When to install:**
- After ClawHub rate limit reset (tomorrow)
- When ready to test video automation
- After Facebook/Instagram setup complete

**Priority:**
- Medium (nice to have, not critical)
- Can start with static images first
- Add video later for scaling

---

**Status:** Draft ready
**Recommendation:** Install after core affiliate workflow is working
**Estimated setup time:** 2-3 hours (including API setup & testing)
