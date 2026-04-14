#!/usr/bin/env node
/**
 * OpenRouter API Key Rotator
 * Auto-rotate API keys when rate limit hit (429 error)
 * 
 * Usage:
 *   node openrouter-rotator.js
 */

const fs = require('fs');
const path = require('path');

// Config file path
const CONFIG_FILE = path.join(__dirname, 'api-keys.json');
const STATE_FILE = path.join(__dirname, 'api-state.json');

// Default config structure
const DEFAULT_CONFIG = {
  keys: [
    // Add your OpenRouter API keys here
    // { id: 1, key: "sk-or-v1-...", name: "Account 1", active: true },
    // { id: 2, key: "sk-or-v1-...", name: "Account 2", active: true },
  ],
  settings: {
    retryDelay: 5000, // 5 seconds
    maxRetries: 3,
    rotateOnError: true,
    logFile: 'api-rotator.log'
  }
};

// State tracking
let state = {
  currentKeyIndex: 0,
  keyStats: {},
  lastRotation: null,
  totalRequests: 0,
  totalErrors: 0
};

// Initialize config
function initConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log(`✅ Config file created: ${CONFIG_FILE}`);
    console.log('📝 Please add your OpenRouter API keys to api-keys.json');
    process.exit(0);
  }
  
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } else {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
}

// Load config
function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

// Save state
function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Get current API key
function getCurrentKey() {
  const config = loadConfig();
  const activeKeys = config.keys.filter(k => k.active);
  
  if (activeKeys.length === 0) {
    throw new Error('❌ No active API keys available!');
  }
  
  // Ensure index is within bounds
  if (state.currentKeyIndex >= activeKeys.length) {
    state.currentKeyIndex = 0;
  }
  
  return activeKeys[state.currentKeyIndex];
}

// Rotate to next key
function rotateKey(reason = 'manual') {
  const config = loadConfig();
  const activeKeys = config.keys.filter(k => k.active);
  
  if (activeKeys.length <= 1) {
    console.log('⚠️  Only one active key, cannot rotate');
    return getCurrentKey();
  }
  
  const oldIndex = state.currentKeyIndex;
  state.currentKeyIndex = (state.currentKeyIndex + 1) % activeKeys.length;
  state.lastRotation = new Date().toISOString();
  
  const oldKey = activeKeys[oldIndex];
  const newKey = activeKeys[state.currentKeyIndex];
  
  console.log(`🔄 Rotated: ${oldKey.name} → ${newKey.name} (${reason})`);
  log(`Rotated from ${oldKey.name} to ${newKey.name} - Reason: ${reason}`);
  
  saveState();
  return newKey;
}

// Log to file
function log(message) {
  const config = loadConfig();
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFileSync(config.settings.logFile, logMessage);
}

// Track key usage
function trackUsage(keyId, success = true) {
  if (!state.keyStats[keyId]) {
    state.keyStats[keyId] = {
      requests: 0,
      errors: 0,
      lastUsed: null,
      lastError: null
    };
  }
  
  state.keyStats[keyId].requests++;
  state.keyStats[keyId].lastUsed = new Date().toISOString();
  state.totalRequests++;
  
  if (!success) {
    state.keyStats[keyId].errors++;
    state.keyStats[keyId].lastError = new Date().toISOString();
    state.totalErrors++;
  }
  
  saveState();
}

// Make API request with auto-rotation
async function makeRequest(endpoint, options = {}) {
  const config = loadConfig();
  let retries = 0;
  
  while (retries < config.settings.maxRetries) {
    const currentKey = getCurrentKey();
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${currentKey.key}`,
          'HTTP-Referer': 'https://openclaw.ai',
          'X-Title': 'OpenClaw API Rotator'
        }
      });
      
      // Check for rate limit
      if (response.status === 429) {
        console.log(`⚠️  Rate limit hit on ${currentKey.name}`);
        log(`Rate limit (429) on ${currentKey.name}`);
        trackUsage(currentKey.id, false);
        
        if (config.settings.rotateOnError) {
          rotateKey('rate_limit');
          retries++;
          await new Promise(resolve => setTimeout(resolve, config.settings.retryDelay));
          continue;
        }
      }
      
      // Success
      if (response.ok) {
        trackUsage(currentKey.id, true);
        return response;
      }
      
      // Other errors
      console.log(`❌ Error ${response.status} on ${currentKey.name}`);
      trackUsage(currentKey.id, false);
      
      if (config.settings.rotateOnError) {
        rotateKey(`error_${response.status}`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, config.settings.retryDelay));
        continue;
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.log(`❌ Request failed on ${currentKey.name}: ${error.message}`);
      log(`Request failed on ${currentKey.name}: ${error.message}`);
      trackUsage(currentKey.id, false);
      
      if (config.settings.rotateOnError && retries < config.settings.maxRetries - 1) {
        rotateKey('error');
        retries++;
        await new Promise(resolve => setTimeout(resolve, config.settings.retryDelay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

// CLI Commands
function showStatus() {
  const config = loadConfig();
  const currentKey = getCurrentKey();
  
  console.log('\n📊 API Key Rotator Status\n');
  console.log(`Current Key: ${currentKey.name} (ID: ${currentKey.id})`);
  console.log(`Total Requests: ${state.totalRequests}`);
  console.log(`Total Errors: ${state.totalErrors}`);
  console.log(`Last Rotation: ${state.lastRotation || 'Never'}\n`);
  
  console.log('📋 Key Statistics:\n');
  config.keys.forEach(key => {
    const stats = state.keyStats[key.id] || { requests: 0, errors: 0 };
    const status = key.active ? '✅' : '❌';
    const current = key.id === currentKey.id ? '👉' : '  ';
    
    console.log(`${current} ${status} ${key.name}`);
    console.log(`   Requests: ${stats.requests} | Errors: ${stats.errors}`);
    console.log(`   Last Used: ${stats.lastUsed || 'Never'}\n`);
  });
}

function addKey(keyString, name) {
  const config = loadConfig();
  const newId = Math.max(0, ...config.keys.map(k => k.id)) + 1;
  
  config.keys.push({
    id: newId,
    key: keyString,
    name: name || `Account ${newId}`,
    active: true
  });
  
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`✅ Added key: ${name || `Account ${newId}`}`);
}

function removeKey(keyId) {
  const config = loadConfig();
  config.keys = config.keys.filter(k => k.id !== parseInt(keyId));
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`✅ Removed key ID: ${keyId}`);
}

function toggleKey(keyId) {
  const config = loadConfig();
  const key = config.keys.find(k => k.id === parseInt(keyId));
  
  if (key) {
    key.active = !key.active;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`✅ ${key.name} is now ${key.active ? 'active' : 'inactive'}`);
  } else {
    console.log(`❌ Key ID ${keyId} not found`);
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

initConfig();

switch (command) {
  case 'status':
    showStatus();
    break;
    
  case 'rotate':
    rotateKey('manual');
    showStatus();
    break;
    
  case 'add':
    if (args.length < 2) {
      console.log('Usage: node openrouter-rotator.js add <api-key> [name]');
      process.exit(1);
    }
    addKey(args[1], args[2]);
    break;
    
  case 'remove':
    if (args.length < 2) {
      console.log('Usage: node openrouter-rotator.js remove <key-id>');
      process.exit(1);
    }
    removeKey(args[1]);
    break;
    
  case 'toggle':
    if (args.length < 2) {
      console.log('Usage: node openrouter-rotator.js toggle <key-id>');
      process.exit(1);
    }
    toggleKey(args[1]);
    break;
    
  case 'test':
    console.log('🧪 Testing API rotation...\n');
    (async () => {
      try {
        const response = await makeRequest('https://openrouter.ai/api/v1/models', {
          method: 'GET'
        });
        const data = await response.json();
        console.log(`✅ Test successful! Found ${data.data?.length || 0} models`);
        showStatus();
      } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
      }
    })();
    break;
    
  default:
    console.log(`
OpenRouter API Key Rotator

Usage:
  node openrouter-rotator.js <command> [options]

Commands:
  status              Show current status and key statistics
  rotate              Manually rotate to next key
  add <key> [name]    Add new API key
  remove <id>         Remove API key by ID
  toggle <id>         Enable/disable API key
  test                Test API rotation with a simple request

Examples:
  node openrouter-rotator.js add sk-or-v1-xxx "Account 1"
  node openrouter-rotator.js status
  node openrouter-rotator.js rotate
  node openrouter-rotator.js test

Config file: ${CONFIG_FILE}
State file: ${STATE_FILE}
    `);
}

// Export for use in other scripts
module.exports = {
  getCurrentKey,
  rotateKey,
  makeRequest,
  trackUsage
};
