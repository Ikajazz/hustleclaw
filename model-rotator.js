#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_FILE = path.join(__dirname, 'model-state.json');
const OPENCLAW_CONFIG = '/root/.openclaw/openclaw.json';

// 5 Free models
const MODELS = [
  {
    id: 1,
    name: 'google/gemini-2.0-flash-exp:free',
    provider: 'openrouter',
    description: 'Google Gemini 2.0 Flash (Fast)',
    active: true
  },
  {
    id: 2,
    name: 'google/gemma-4-26b-a4b-it:free',
    provider: 'openrouter',
    description: 'Google Gemma 4 26B (Medium)',
    active: true
  },
  {
    id: 3,
    name: 'meta-llama/llama-3.2-3b-instruct:free',
    provider: 'openrouter',
    description: 'Meta Llama 3.2 3B (Light)',
    active: true
  },
  {
    id: 4,
    name: 'microsoft/phi-3-mini-128k-instruct:free',
    provider: 'openrouter',
    description: 'Microsoft Phi-3 Mini (Long context)',
    active: true
  },
  {
    id: 5,
    name: 'qwen/qwen-2.5-7b-instruct:free',
    provider: 'openrouter',
    description: 'Qwen 2.5 7B (Balanced)',
    active: true
  }
];

// Initialize state
function initState() {
  if (!fs.existsSync(STATE_FILE)) {
    const initialState = {
      currentModelId: 1,
      currentModel: MODELS[0].name,
      models: MODELS.map(m => ({
        ...m,
        requests: 0,
        errors: 0,
        rateLimitHits: 0,
        lastUsed: null,
        lastError: null,
        cooldownUntil: null
      })),
      totalRequests: 0,
      totalErrors: 0,
      lastRotation: new Date().toISOString(),
      rotationHistory: []
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
    return initialState;
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// Save state
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Get current model from OpenClaw config
function getCurrentModelFromConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf8'));
    return config.agents?.defaults?.model || null;
  } catch (error) {
    console.error('❌ Error reading OpenClaw config:', error.message);
    return null;
  }
}

// Update OpenClaw config with new model
function updateOpenClawConfig(modelName) {
  try {
    const config = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf8'));
    
    if (!config.agents) config.agents = {};
    if (!config.agents.defaults) config.agents.defaults = {};
    
    config.agents.defaults.model = `openrouter/${modelName}`;
    
    // Backup config
    const backupPath = `${OPENCLAW_CONFIG}.backup.${Date.now()}`;
    fs.copyFileSync(OPENCLAW_CONFIG, backupPath);
    
    // Write new config
    fs.writeFileSync(OPENCLAW_CONFIG, JSON.stringify(config, null, 2));
    
    console.log(`✅ Updated OpenClaw config: openrouter/${modelName}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating OpenClaw config:', error.message);
    return false;
  }
}

// Restart OpenClaw
function restartOpenClaw() {
  try {
    console.log('🔄 Restarting OpenClaw...');
    execSync('openclaw gateway restart', { stdio: 'inherit' });
    console.log('✅ OpenClaw restarted');
    return true;
  } catch (error) {
    console.error('❌ Error restarting OpenClaw:', error.message);
    console.log('💡 Try manual restart: openclaw gateway restart');
    return false;
  }
}

// Get next available model (skip cooldown)
function getNextModel(state) {
  const now = new Date();
  const activeModels = state.models.filter(m => {
    if (!m.active) return false;
    if (m.cooldownUntil && new Date(m.cooldownUntil) > now) return false;
    return true;
  });
  
  if (activeModels.length === 0) {
    console.log('⚠️ All models in cooldown or disabled. Using first model anyway.');
    return state.models[0];
  }
  
  // Round-robin: find next model after current
  const currentIndex = state.models.findIndex(m => m.id === state.currentModelId);
  
  for (let i = 1; i <= state.models.length; i++) {
    const nextIndex = (currentIndex + i) % state.models.length;
    const candidate = state.models[nextIndex];
    
    if (candidate.active && (!candidate.cooldownUntil || new Date(candidate.cooldownUntil) <= now)) {
      return candidate;
    }
  }
  
  return activeModels[0];
}

// Rotate to next model
function rotate(reason = 'manual') {
  const state = initState();
  const nextModel = getNextModel(state);
  
  console.log(`\n🔄 Rotating model (reason: ${reason})`);
  console.log(`   From: ${state.currentModel}`);
  console.log(`   To:   ${nextModel.name}`);
  
  // Update state
  state.currentModelId = nextModel.id;
  state.currentModel = nextModel.name;
  state.lastRotation = new Date().toISOString();
  state.rotationHistory.push({
    timestamp: new Date().toISOString(),
    from: state.currentModel,
    to: nextModel.name,
    reason
  });
  
  // Keep only last 50 rotations
  if (state.rotationHistory.length > 50) {
    state.rotationHistory = state.rotationHistory.slice(-50);
  }
  
  saveState(state);
  
  // Update OpenClaw config
  if (updateOpenClawConfig(nextModel.name)) {
    restartOpenClaw();
  }
  
  return nextModel;
}

// Mark model as rate limited
function markRateLimited(modelName, cooldownMinutes = 30) {
  const state = initState();
  const model = state.models.find(m => m.name === modelName);
  
  if (model) {
    model.rateLimitHits++;
    model.errors++;
    model.lastError = new Date().toISOString();
    model.cooldownUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000).toISOString();
    
    console.log(`⏸️ Model ${modelName} marked as rate limited`);
    console.log(`   Cooldown until: ${model.cooldownUntil}`);
    
    saveState(state);
    
    // Auto-rotate to next model
    rotate('rate_limit');
  }
}

// Show status
function showStatus() {
  const state = initState();
  const configModel = getCurrentModelFromConfig();
  const now = new Date();
  
  console.log('\n📊 Model Rotator Status\n');
  console.log(`Current Model: ${state.currentModel} (ID: ${state.currentModelId})`);
  console.log(`Config Model:  ${configModel}`);
  console.log(`Total Requests: ${state.totalRequests}`);
  console.log(`Total Errors: ${state.totalErrors}`);
  console.log(`Last Rotation: ${state.lastRotation}`);
  
  console.log('\n📋 Model Statistics:\n');
  
  state.models.forEach(model => {
    const isCurrent = model.id === state.currentModelId;
    const inCooldown = model.cooldownUntil && new Date(model.cooldownUntil) > now;
    const status = !model.active ? '❌ Disabled' : inCooldown ? '⏸️ Cooldown' : '✅ Active';
    
    console.log(`${isCurrent ? '👉 ' : '   '}${status} ${model.name}`);
    console.log(`   ${model.description}`);
    console.log(`   Requests: ${model.requests} | Errors: ${model.errors} | Rate Limits: ${model.rateLimitHits}`);
    console.log(`   Last Used: ${model.lastUsed || 'Never'}`);
    
    if (inCooldown) {
      const cooldownEnd = new Date(model.cooldownUntil);
      const minutesLeft = Math.ceil((cooldownEnd - now) / 60000);
      console.log(`   Cooldown: ${minutesLeft} minutes left`);
    }
    
    console.log('');
  });
  
  if (state.rotationHistory.length > 0) {
    console.log('📜 Recent Rotations (last 5):\n');
    state.rotationHistory.slice(-5).forEach(r => {
      console.log(`   ${r.timestamp} - ${r.reason}`);
      console.log(`   ${r.from} → ${r.to}\n`);
    });
  }
}

// Test current model
async function testModel() {
  const state = initState();
  const currentModel = state.models.find(m => m.id === state.currentModelId);
  
  console.log(`\n🧪 Testing model: ${currentModel.name}\n`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'sk-or-v1-...'}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/openclaw/openclaw',
        'X-Title': 'OpenClaw Model Rotator'
      },
      body: JSON.stringify({
        model: currentModel.name,
        messages: [
          { role: 'user', content: 'Say "test successful" if you can read this.' }
        ],
        max_tokens: 50
      })
    });
    
    if (response.status === 429) {
      console.log('❌ Rate limit detected (HTTP 429)');
      markRateLimited(currentModel.name);
      return;
    }
    
    if (!response.ok) {
      console.log(`❌ Test failed: HTTP ${response.status}`);
      const error = await response.text();
      console.log(`   Error: ${error.substring(0, 200)}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Test successful!');
    console.log(`   Response: ${data.choices[0].message.content}`);
    
    // Update stats
    currentModel.requests++;
    currentModel.lastUsed = new Date().toISOString();
    state.totalRequests++;
    saveState(state);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'status':
    showStatus();
    break;
  
  case 'rotate':
    rotate('manual');
    break;
  
  case 'test':
    testModel();
    break;
  
  case 'mark-rate-limited':
    const modelName = process.argv[3];
    const cooldown = parseInt(process.argv[4]) || 30;
    if (!modelName) {
      console.log('Usage: node model-rotator.js mark-rate-limited <model-name> [cooldown-minutes]');
      process.exit(1);
    }
    markRateLimited(modelName, cooldown);
    break;
  
  case 'reset':
    fs.unlinkSync(STATE_FILE);
    console.log('✅ State reset');
    initState();
    break;
  
  default:
    console.log('OpenRouter Model Rotator\n');
    console.log('Usage:');
    console.log('  node model-rotator.js <command>\n');
    console.log('Commands:');
    console.log('  status                              Show current status and model statistics');
    console.log('  rotate                              Manually rotate to next model');
    console.log('  test                                Test current model');
    console.log('  mark-rate-limited <model> [mins]    Mark model as rate limited (default: 30 min cooldown)');
    console.log('  reset                               Reset state file\n');
    console.log('Examples:');
    console.log('  node model-rotator.js status');
    console.log('  node model-rotator.js rotate');
    console.log('  node model-rotator.js mark-rate-limited google/gemini-2.0-flash-exp:free 60');
}
