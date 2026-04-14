# HustleClaw Affiliate Campaign - TaskFlow Example

## Workflow: Daily Affiliate Campaign

**Goal:** Automate daily Shopee affiliate campaign from research to posting

**Steps:**
1. Research trending products
2. Generate content batch
3. Schedule posts
4. Wait 24 hours
5. Analyze performance
6. Optimize & repeat

---

## TaskFlow Implementation

### Step 1: Create Flow

```javascript
const taskFlow = api.runtime.tasks.flow.fromToolContext(ctx);

const campaign = taskFlow.createManaged({
  controllerId: "hustleclaw/daily-affiliate",
  goal: "Daily Shopee affiliate campaign",
  currentStep: "research",
  stateJson: {
    date: "2026-04-13",
    products: [],
    posts: [],
    scheduled: [],
    performance: {}
  }
});

console.log(`Campaign started: ${campaign.flowId}`);
```

### Step 2: Research Products

```javascript
// Run research task
const researchTask = taskFlow.runTask({
  flowId: campaign.flowId,
  runtime: "subagent",
  childSessionKey: "agent:main:subagent:researcher",
  runId: "research-products-1",
  task: "Research 20 trending Shopee products with high commission",
  status: "running",
  startedAt: Date.now(),
  lastEventAt: Date.now()
});

// Wait for research to complete
const waitingResearch = taskFlow.setWaiting({
  flowId: campaign.flowId,
  expectedRevision: campaign.revision,
  currentStep: "await_research",
  stateJson: campaign.stateJson,
  waitJson: {
    kind: "task_completion",
    taskId: researchTask.taskId,
    timeout: 600000 // 10 minutes
  }
});

// When research completes, resume with products
const resumeWithProducts = taskFlow.resume({
  flowId: campaign.flowId,
  expectedRevision: waitingResearch.flow.revision,
  status: "running",
  currentStep: "generate_content",
  stateJson: {
    ...waitingResearch.flow.stateJson,
    products: [
      { id: 1, name: "Celana Kulot", price: 79000, commission: 6 },
      { id: 2, name: "Lip Tint Korea", price: 29000, commission: 6 },
      // ... 18 more products
    ]
  }
});
```

### Step 3: Generate Content

```javascript
// Run content generation task
const contentTask = taskFlow.runTask({
  flowId: campaign.flowId,
  runtime: "subagent",
  childSessionKey: "agent:main:subagent:content-creator",
  runId: "generate-content-1",
  task: "Generate 50 posts for 20 products (Facebook, Instagram, TikTok)",
  status: "running",
  startedAt: Date.now(),
  lastEventAt: Date.now()
});

// Wait for content generation
const waitingContent = taskFlow.setWaiting({
  flowId: campaign.flowId,
  expectedRevision: resumeWithProducts.flow.revision,
  currentStep: "await_content",
  stateJson: resumeWithProducts.flow.stateJson,
  waitJson: {
    kind: "task_completion",
    taskId: contentTask.taskId,
    timeout: 900000 // 15 minutes
  }
});

// Resume with generated posts
const resumeWithPosts = taskFlow.resume({
  flowId: campaign.flowId,
  expectedRevision: waitingContent.flow.revision,
  status: "running",
  currentStep: "schedule_posts",
  stateJson: {
    ...waitingContent.flow.stateJson,
    posts: [
      { id: 1, platform: "facebook", content: "...", productId: 1 },
      { id: 2, platform: "instagram", content: "...", productId: 1 },
      // ... 48 more posts
    ]
  }
});
```

### Step 4: Schedule Posts

```javascript
// Run scheduling task
const scheduleTask = taskFlow.runTask({
  flowId: campaign.flowId,
  runtime: "subagent",
  childSessionKey: "agent:main:subagent:scheduler",
  runId: "schedule-posts-1",
  task: "Schedule 50 posts across platforms (3-5 posts/day)",
  status: "running",
  startedAt: Date.now(),
  lastEventAt: Date.now()
});

// Wait for scheduling
const waitingSchedule = taskFlow.setWaiting({
  flowId: campaign.flowId,
  expectedRevision: resumeWithPosts.flow.revision,
  currentStep: "await_schedule",
  stateJson: resumeWithPosts.flow.stateJson,
  waitJson: {
    kind: "task_completion",
    taskId: scheduleTask.taskId,
    timeout: 300000 // 5 minutes
  }
});

// Resume with scheduled posts
const resumeWithSchedule = taskFlow.resume({
  flowId: campaign.flowId,
  expectedRevision: waitingSchedule.flow.revision,
  status: "running",
  currentStep: "wait_24h",
  stateJson: {
    ...waitingSchedule.flow.stateJson,
    scheduled: [
      { postId: 1, scheduledAt: "2026-04-13T08:00:00Z", status: "pending" },
      { postId: 2, scheduledAt: "2026-04-13T12:00:00Z", status: "pending" },
      // ... 48 more
    ]
  }
});
```

### Step 5: Wait 24 Hours

```javascript
// Wait for 24 hours to collect performance data
const waiting24h = taskFlow.setWaiting({
  flowId: campaign.flowId,
  expectedRevision: resumeWithSchedule.flow.revision,
  currentStep: "waiting_performance",
  stateJson: resumeWithSchedule.flow.stateJson,
  waitJson: {
    kind: "time_delay",
    resumeAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    reason: "Waiting for performance data"
  }
});

// After 24 hours, resume for analysis
const resumeForAnalysis = taskFlow.resume({
  flowId: campaign.flowId,
  expectedRevision: waiting24h.flow.revision,
  status: "running",
  currentStep: "analyze_performance",
  stateJson: waiting24h.flow.stateJson
});
```

### Step 6: Analyze Performance

```javascript
// Run analysis task
const analysisTask = taskFlow.runTask({
  flowId: campaign.flowId,
  runtime: "subagent",
  childSessionKey: "agent:main:subagent:analyst",
  runId: "analyze-performance-1",
  task: "Analyze campaign performance: clicks, conversions, revenue",
  status: "running",
  startedAt: Date.now(),
  lastEventAt: Date.now()
});

// Wait for analysis
const waitingAnalysis = taskFlow.setWaiting({
  flowId: campaign.flowId,
  expectedRevision: resumeForAnalysis.flow.revision,
  currentStep: "await_analysis",
  stateJson: resumeForAnalysis.flow.stateJson,
  waitJson: {
    kind: "task_completion",
    taskId: analysisTask.taskId,
    timeout: 300000 // 5 minutes
  }
});

// Resume with performance data
const resumeWithPerformance = taskFlow.resume({
  flowId: campaign.flowId,
  expectedRevision: waitingAnalysis.flow.revision,
  status: "running",
  currentStep: "optimize",
  stateJson: {
    ...waitingAnalysis.flow.stateJson,
    performance: {
      totalClicks: 450,
      conversions: 23,
      revenue: 2300000, // IDR
      topProducts: [1, 5, 12],
      topPlatforms: ["facebook", "instagram"]
    }
  }
});
```

### Step 7: Optimize & Finish

```javascript
// Run optimization task
const optimizeTask = taskFlow.runTask({
  flowId: campaign.flowId,
  runtime: "subagent",
  childSessionKey: "agent:main:subagent:optimizer",
  runId: "optimize-campaign-1",
  task: "Optimize next campaign based on performance data",
  status: "running",
  startedAt: Date.now(),
  lastEventAt: Date.now()
});

// Wait for optimization
const waitingOptimize = taskFlow.setWaiting({
  flowId: campaign.flowId,
  expectedRevision: resumeWithPerformance.flow.revision,
  currentStep: "await_optimize",
  stateJson: resumeWithPerformance.flow.stateJson,
  waitJson: {
    kind: "task_completion",
    taskId: optimizeTask.taskId,
    timeout: 300000
  }
});

// Finish campaign
const finished = taskFlow.finish({
  flowId: campaign.flowId,
  expectedRevision: waitingOptimize.flow.revision,
  stateJson: {
    ...waitingOptimize.flow.stateJson,
    optimizations: {
      focusProducts: [1, 5, 12],
      focusPlatforms: ["facebook", "instagram"],
      increaseBudget: true,
      nextCampaignDate: "2026-04-14"
    }
  }
});

console.log(`Campaign finished: ${finished.flow.flowId}`);
console.log(`Revenue: IDR ${finished.flow.stateJson.performance.revenue}`);
```

---

## Automation Script

### daily-campaign.js

```javascript
#!/usr/bin/env node
/**
 * HustleClaw Daily Affiliate Campaign
 * Runs automatically via cron
 */

const { api } = require('openclaw');

async function runDailyCampaign() {
  const ctx = { sessionKey: 'agent:main' }; // Your session
  const taskFlow = api.runtime.tasks.flow.fromToolContext(ctx);
  
  try {
    // Create campaign flow
    const campaign = taskFlow.createManaged({
      controllerId: "hustleclaw/daily-affiliate",
      goal: `Daily campaign ${new Date().toISOString().split('T')[0]}`,
      currentStep: "research",
      stateJson: {
        date: new Date().toISOString().split('T')[0],
        products: [],
        posts: [],
        scheduled: [],
        performance: {}
      }
    });
    
    console.log(`✅ Campaign started: ${campaign.flowId}`);
    
    // Trigger research (rest handled by TaskFlow)
    // ... implementation
    
  } catch (error) {
    console.error(`❌ Campaign failed: ${error.message}`);
  }
}

runDailyCampaign();
```

### Cron Job

```bash
# Run daily campaign at 6 AM
0 6 * * * cd /root/.openclaw/workspace && node daily-campaign.js >> /var/log/hustleclaw-campaign.log 2>&1
```

---

## Benefits

**1. Resilient**
- Survives OpenClaw restarts
- Can resume from any step
- State persisted automatically

**2. Observable**
- Track progress via flowId
- Inspect state at any time
- Clear step transitions

**3. Scalable**
- Run multiple campaigns simultaneously
- Each campaign independent
- Easy to add more steps

**4. Maintainable**
- Clear workflow structure
- Easy to debug
- Modular steps

---

## Monitoring

### Check Campaign Status

```bash
# Via OpenClaw CLI
openclaw tasks list --controller hustleclaw/daily-affiliate

# Via API
curl http://localhost:18789/api/tasks/flow/${flowId}
```

### View Logs

```bash
tail -f /var/log/hustleclaw-campaign.log
```

---

## Next Steps

1. Implement each step as separate script
2. Test workflow end-to-end
3. Add error handling & retries
4. Setup monitoring & alerts
5. Scale to multiple campaigns

---

**Status:** Example ready for implementation
**Estimated setup time:** 4-6 hours
