#!/usr/bin/env node
/**
 * Telegram Group Cleanup Analyzer
 * Analyze groups and recommend which ones to delete
 * 
 * Note: This is a template. You need Telegram API credentials to run.
 */

// Spam keywords (Indonesian + English)
const SPAM_KEYWORDS = [
  // Judol
  'judol', 'slot', 'gacor', 'maxwin', 'jackpot', 'deposit',
  'scatter', 'rtp', 'pragmatic', 'pg soft',
  
  // Drama
  'drama', 'gosip', 'berantem', 'ribut', 'toxic',
  
  // Scam
  'investasi cepat', 'untung besar', 'passive income mudah',
  'daftar sekarang', 'klik link', 'promo terbatas',
  
  // Spam
  'forward', 'share', 'viral', 'wajib baca',
  'jangan sampai', 'buruan', 'limited'
];

// Group categories
const CATEGORIES = {
  SPAM: 'spam',
  DEAD: 'dead',
  DRAMA: 'drama',
  PRODUCTIVE: 'productive',
  BUSINESS: 'business'
};

/**
 * Analyze group based on criteria
 */
function analyzeGroup(group) {
  const score = {
    spam: 0,
    dead: 0,
    drama: 0,
    productive: 0
  };
  
  // Check group name for spam keywords
  const groupName = group.title.toLowerCase();
  SPAM_KEYWORDS.forEach(keyword => {
    if (groupName.includes(keyword)) {
      score.spam += 10;
    }
  });
  
  // Check last activity
  const daysSinceLastMessage = group.daysSinceLastMessage || 0;
  if (daysSinceLastMessage > 30) {
    score.dead += 20;
  } else if (daysSinceLastMessage > 7) {
    score.dead += 10;
  }
  
  // Check message frequency
  const messagesPerDay = group.messagesPerDay || 0;
  if (messagesPerDay > 100) {
    score.spam += 5; // Too noisy
  } else if (messagesPerDay > 20 && messagesPerDay < 100) {
    score.productive += 10; // Active but not spam
  } else if (messagesPerDay < 5) {
    score.dead += 5;
  }
  
  // Check member count
  const memberCount = group.memberCount || 0;
  if (memberCount > 1000) {
    score.spam += 5; // Large groups often spam
  } else if (memberCount < 10) {
    score.dead += 5; // Too small, probably dead
  }
  
  // Determine category
  const maxScore = Math.max(score.spam, score.dead, score.drama, score.productive);
  
  if (score.spam === maxScore && score.spam > 10) {
    return { category: CATEGORIES.SPAM, score: score.spam, reason: 'Spam keywords detected' };
  } else if (score.dead === maxScore && score.dead > 15) {
    return { category: CATEGORIES.DEAD, score: score.dead, reason: 'No activity for 30+ days' };
  } else if (score.productive === maxScore) {
    return { category: CATEGORIES.PRODUCTIVE, score: score.productive, reason: 'Active and productive' };
  } else {
    return { category: CATEGORIES.BUSINESS, score: 0, reason: 'Neutral' };
  }
}

/**
 * Generate cleanup report
 */
function generateReport(groups) {
  const report = {
    total: groups.length,
    toDelete: [],
    toKeep: [],
    toReview: []
  };
  
  groups.forEach(group => {
    const analysis = analyzeGroup(group);
    
    if (analysis.category === CATEGORIES.SPAM || analysis.category === CATEGORIES.DEAD) {
      report.toDelete.push({
        name: group.title,
        id: group.id,
        category: analysis.category,
        reason: analysis.reason,
        score: analysis.score
      });
    } else if (analysis.category === CATEGORIES.PRODUCTIVE) {
      report.toKeep.push({
        name: group.title,
        id: group.id,
        reason: analysis.reason
      });
    } else {
      report.toReview.push({
        name: group.title,
        id: group.id,
        reason: analysis.reason
      });
    }
  });
  
  return report;
}

/**
 * Print report
 */
function printReport(report) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Telegram Group Cleanup Report                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`Total Groups: ${report.total}`);
  console.log(`To Delete: ${report.toDelete.length}`);
  console.log(`To Keep: ${report.toKeep.length}`);
  console.log(`To Review: ${report.toReview.length}\n`);
  
  if (report.toDelete.length > 0) {
    console.log('🗑️  RECOMMENDED TO DELETE:\n');
    report.toDelete.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name}`);
      console.log(`   Category: ${group.category}`);
      console.log(`   Reason: ${group.reason}`);
      console.log(`   Score: ${group.score}\n`);
    });
  }
  
  if (report.toKeep.length > 0) {
    console.log('✅ RECOMMENDED TO KEEP:\n');
    report.toKeep.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name}`);
      console.log(`   Reason: ${group.reason}\n`);
    });
  }
  
  if (report.toReview.length > 0) {
    console.log('⚠️  REVIEW MANUALLY:\n');
    report.toReview.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name}`);
      console.log(`   Reason: ${group.reason}\n`);
    });
  }
}

/**
 * Main function
 */
async function main() {
  // TODO: Fetch groups from Telegram API
  // For now, using mock data
  
  const mockGroups = [
    {
      id: 1,
      title: 'Slot Gacor Maxwin 🎰',
      memberCount: 5000,
      messagesPerDay: 200,
      daysSinceLastMessage: 0
    },
    {
      id: 2,
      title: 'Drama Artis Indonesia',
      memberCount: 3000,
      messagesPerDay: 150,
      daysSinceLastMessage: 0
    },
    {
      id: 3,
      title: 'Old School Friends',
      memberCount: 25,
      messagesPerDay: 0,
      daysSinceLastMessage: 90
    },
    {
      id: 4,
      title: 'HustleClaw Community',
      memberCount: 50,
      messagesPerDay: 30,
      daysSinceLastMessage: 0
    },
    {
      id: 5,
      title: 'Web3 Indonesia',
      memberCount: 200,
      messagesPerDay: 40,
      daysSinceLastMessage: 1
    }
  ];
  
  const report = generateReport(mockGroups);
  printReport(report);
  
  console.log('\n📝 Next Steps:');
  console.log('1. Review the "To Delete" list');
  console.log('2. Manually delete groups from Telegram');
  console.log('3. Keep productive groups');
  console.log('4. Archive groups you might need later\n');
}

// Run
main().catch(console.error);

module.exports = { analyzeGroup, generateReport };
