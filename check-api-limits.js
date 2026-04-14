#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'api-keys.json');

async function checkLimit(apiKey, accountName) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        account: accountName,
        status: '❌ Error',
        error: `HTTP ${response.status}`,
        limit: null,
        usage: null,
        remaining: null
      };
    }

    const data = await response.json();
    
    return {
      account: accountName,
      status: '✅ Active',
      limit: data.data?.limit || 'Unknown',
      usage: data.data?.usage || 0,
      remaining: data.data?.limit ? (data.data.limit - (data.data?.usage || 0)) : 'Unknown',
      rateLimit: data.data?.rate_limit || 'Unknown',
      label: data.data?.label || 'No label'
    };
  } catch (error) {
    return {
      account: accountName,
      status: '❌ Error',
      error: error.message,
      limit: null,
      usage: null,
      remaining: null
    };
  }
}

async function main() {
  console.log('🔍 Checking API limits for all accounts...\n');

  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Config file not found:', CONFIG_FILE);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const keys = config.keys.filter(k => k.active);

  console.log(`Found ${keys.length} enabled keys\n`);

  const results = [];
  for (const key of keys) {
    process.stdout.write(`Checking ${key.name}... `);
    const result = await checkLimit(key.key, key.name);
    results.push(result);
    console.log(result.status);
    
    // Rate limit protection
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Detailed Limit Report:\n');
  
  for (const result of results) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📌 ${result.account}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else {
      console.log(`   Label: ${result.label}`);
      console.log(`   Limit: ${result.limit}`);
      console.log(`   Usage: ${result.usage}`);
      console.log(`   Remaining: ${result.remaining}`);
      console.log(`   Rate Limit: ${result.rateLimit}`);
    }
  }
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // Summary
  const active = results.filter(r => r.status === '✅ Active').length;
  const errors = results.filter(r => r.status === '❌ Error').length;
  
  console.log(`📈 Summary:`);
  console.log(`   Active: ${active}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${results.length}`);
}

main().catch(console.error);
