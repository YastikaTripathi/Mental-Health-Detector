let selectedMood = null;
let chartInstances = {};

// Mental health assessment questions
const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being restless",
  "Thoughts that you would be better off dead"
];

const gad7Questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

const ratingLabels = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

// Motivational quotes by mood
const motivationalQuotes = {
  excellent: [
    { text: "You're radiating positivity! Keep spreading that amazing energy!", author: "Life Wisdom" },
    { text: "When you're feeling great, remember to savor every moment.", author: "Mindfulness Practice" },
    { text: "Your excellent mood is a gift - share it with the world!", author: "Positive Psychology" },
    { text: "Excellence is not a skill, it's an attitude. You're living proof of that!", author: "Ralph Marston" }
  ],
  happy: [
    { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "The best way to cheer yourself is to try to cheer someone else up.", author: "Mark Twain" },
    { text: "Happiness is a choice, not a result. Nothing will make you happy until you choose to be happy.", author: "Ralph Marston" },
    { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" }
  ],
  good: [
    { text: "Good days start with gratitude and positive intentions.", author: "Daily Wisdom" },
    { text: "You're doing better than you think. Keep up the great work!", author: "Self-Encouragement" },
    { text: "Every good day is a step towards a better tomorrow.", author: "Hope & Progress" },
    { text: "A good day is a good day. A bad day is a good story. This is a great day!", author: "Life Perspective" }
  ],
  neutral: [
    { text: "It's okay to have neutral days. They're part of being human.", author: "Self-Acceptance" },
    { text: "Sometimes the most ordinary day can be made extraordinary by how you choose to see it.", author: "Perspective Shift" },
    { text: "Neutral is not bad - it's a balanced state where new possibilities can emerge.", author: "Mindful Living" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" }
  ],
  low: [
    { text: "Low moments don't define you. You have the strength to rise again.", author: "Resilience Reminder" },
    { text: "This feeling is temporary. You've overcome challenges before, and you can do it again.", author: "Inner Strength" },
    { text: "Be gentle with yourself. Healing takes time, and that's perfectly okay.", author: "Self-Compassion" },
    { text: "The darkest nights produce the brightest stars.", author: "Hope & Healing" }
  ],
  sad: [
    { text: "It's okay to not be okay. Your feelings are valid, and you're not alone.", author: "Emotional Validation" },
    { text: "Sadness is part of life, but it doesn't last forever. Brighter days are ahead.", author: "Hope & Healing" },
    { text: "Even in sadness, you are worthy of love and kindness - especially from yourself.", author: "Self-Love Reminder" },
    { text: "Tears are words the heart can't express.", author: "Gerard Way" }
  ],
  anxious: [
    { text: "Anxiety is temporary. Take deep breaths and focus on what you can control.", author: "Calm Guidance" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { text: "This too shall pass. You have the tools within you to find peace.", author: "Mindful Reassurance" },
    { text: "Breathe in peace, breathe out worry. You've got this.", author: "Anxiety Relief" }
  ],
  stressed: [
    { text: "Stress is caused by being 'here' but wanting to be 'there'. Focus on the present moment.", author: "Mindfulness Teaching" },
    { text: "You don't have to control every outcome. Sometimes letting go brings the greatest relief.", author: "Release & Relief" },
    { text: "Take it one breath at a time, one moment at a time. You've got this.", author: "Step-by-Step Encouragement" },
    { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" }
  ]
};

// AI Assessment patterns and indicators
const mentalHealthIndicators = {
  depression: {
    moodPatterns: ['sad', 'low', 'neutral'],
    energyThreshold: 4,
    frequencyThreshold: 0.6,
    consecutiveDays: 5
  },
  anxiety: {
    moodPatterns: ['anxious', 'stressed'],
    energyThreshold: 7,
    frequencyThreshold: 0.4,
    consecutiveDays: 3
  },
  wellness: {
    moodPatterns: ['excellent', 'happy', 'good'],
    energyThreshold: 6,
    frequencyThreshold: 0.5,
    consecutiveDays: 3
  },
  burnout: {
    moodPatterns: ['stressed', 'low', 'neutral'],
    energyThreshold: 3,
    frequencyThreshold: 0.7,
    consecutiveDays: 7
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  initializeAssessments();
  loadMoodData();
  updateCharts();
  loadResources();
  generateMotivationalQuote();
  loadThemePreference();
});

// Event listeners
function initializeEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Mood selection
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => selectMood(btn.dataset.mood, btn));
  });
  
  // Energy level slider
  document.getElementById('energyLevel').addEventListener('input', function() {
    document.getElementById('energyValue').textContent = this.value;
  });
  
  // Add mood button
  document.getElementById('addMoodBtn').addEventListener('click', addMoodEntry);
  
  // Assessment buttons
  document.getElementById('calculateAssessment').addEventListener('click', calculateAssessment);
  document.getElementById('runAIAssessment').addEventListener('click', runAIAssessment);
  
  // Quote button
  document.getElementById('newQuoteBtn').addEventListener('click', () => generateMotivationalQuote());
  
  // Export/Import buttons
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('importData').addEventListener('click', () => document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', importData);
}

// Load theme preference
function loadThemePreference() {
  if (localStorage.getItem('darkTheme') === 'true') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').innerHTML = '☀️ Light Mode';
  }
}

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const themeToggle = document.getElementById('themeToggle');
  if (document.body.classList.contains('dark-theme')) {
    themeToggle.innerHTML = '☀️ Light Mode';
    localStorage.setItem('darkTheme', 'true');
  } else {
    themeToggle.innerHTML = '🌙 Dark Mode';
    localStorage.setItem('darkTheme', 'false');
  }
}

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  if (tabName === 'analytics') {
    setTimeout(() => updateAnalytics(), 100);
  } else if (tabName === 'progress') {
    setTimeout(() => updateProgress(), 100);
  }
}

// Mood selection
function selectMood(mood, element) {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  element.classList.add('selected');
  selectedMood = mood;
}

// Add mood entry
function addMoodEntry() {
  if (!selectedMood) {
    showNotification('Please select a mood first!', 'warning');
    return;
  }

  const note = document.getElementById('moodNote').value;
  const energyLevel = document.getElementById('energyLevel').value;
  const timestamp = new Date().getTime();
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  const moodEntry = {
    mood: selectedMood,
    note: note,
    energyLevel: parseInt(energyLevel),
    date: date,
    time: time,
    timestamp: timestamp
  };

  // Save to localStorage
  let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  moodData.push(moodEntry);
  localStorage.setItem('moodData', JSON.stringify(moodData));

  // Reset form
  document.getElementById('moodNote').value = '';
  document.getElementById('energyLevel').value = '5';
  document.getElementById('energyValue').textContent = '5';
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  selectedMood = null;

  // Update UI
  loadMoodData();
  updateCharts();
  createMoodBubble(moodEntry.mood);
  showNotification('Mood logged successfully!', 'success');

  // Show personalized tip
  showPersonalizedTip(moodEntry);
  
  // Update motivational quote based on current mood
  generateMotivationalQuote(moodEntry.mood);
}

// Generate motivational quote
function generateMotivationalQuote(currentMood = null) {
  let quotes = [];
  
  if (currentMood && motivationalQuotes[currentMood]) {
    quotes = motivationalQuotes[currentMood];
  } else {
    // Get recent mood data to determine overall mood
    const recentMoods = getRecentMoods(7);
    if (recentMoods.length > 0) {
      const dominantMood = getMostFrequentMood(recentMoods);
      quotes = motivationalQuotes[dominantMood] || motivationalQuotes.neutral;
    } else {
      quotes = motivationalQuotes.neutral;
    }
  }
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quoteText').textContent = randomQuote.text;
  document.getElementById('quoteAuthor').textContent = `- ${randomQuote.author}`;
}

// AI-powered mental health assessment
function runAIAssessment() {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  
  if (moodData.length < 7) {
    document.getElementById('aiAssessmentResults').innerHTML = `
      <div class="result-card result-mild">
        <h4>📊 Insufficient Data</h4>
        <p>We need at least 7 mood entries to provide an accurate AI assessment. You currently have ${moodData.length} entries.</p>
        <p><strong>Recommendation:</strong> Continue logging your daily mood for more personalized insights.</p>
      </div>
    `;
    return;
  }

  const assessment = analyzePersonalMoodPatterns(moodData);
  displayAIAssessmentResults(assessment);
}

// Analyze personal mood patterns using AI logic
function analyzePersonalMoodPatterns(moodData) {
  const recentData = moodData.slice(-30); // Last 30 entries
  const weekData = moodData.slice(-7);   // Last 7 entries
  
  // Calculate various metrics
  const avgMoodScore = calculateAverageMoodScore(recentData);
  const avgEnergyLevel = calculateAverageEnergy(recentData);
  const moodStability = calculateMoodStability(recentData);
  const trendDirection = calculateMoodTrend(recentData);
  
  // Pattern detection
  const patterns = detectMoodPatterns(recentData);
  const riskFactors = identifyRiskFactors(recentData, weekData);
  const strengths = identifyStrengths(recentData);
  
  // Generate insights
  const overallAssessment = determineOverallWellbeing(avgMoodScore, avgEnergyLevel, moodStability, riskFactors.length);
  const recommendations = generatePersonalizedRecommendations(overallAssessment, patterns, riskFactors);
  
  return {
    overallScore: avgMoodScore,
    energyLevel: avgEnergyLevel,
    stability: moodStability,
    trend: trendDirection,
    assessment: overallAssessment,
    patterns: patterns,
    riskFactors: riskFactors,
    strengths: strengths,
    recommendations: recommendations,
    dataPoints: recentData.length
  };
}

// Helper functions for AI assessment
function calculateAverageMoodScore(data) {
  const moodScores = {
    'excellent': 10, 'happy': 8, 'good': 7, 'neutral': 5,
    'low': 3, 'sad': 2, 'anxious': 3, 'stressed': 2
  };
  
  const scores = data.map(entry => moodScores[entry.mood] || 5);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function calculateAverageEnergy(data) {
  const energyLevels = data.map(entry => entry.energyLevel || 5);
  return energyLevels.reduce((sum, level) => sum + level, 0) / energyLevels.length;
}

function calculateMoodStability(data) {
  const moodScores = data.map(entry => {
    const scores = { 'excellent': 10, 'happy': 8, 'good': 7, 'neutral': 5, 'low': 3, 'sad': 2, 'anxious': 3, 'stressed': 2 };
    return scores[entry.mood] || 5;
  });
  
  if (moodScores.length < 2) return 1;
  
  const mean = moodScores.reduce((a, b) => a + b) / moodScores.length;
  const variance = moodScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / moodScores.length;
  
  return Math.max(0, 1 - (Math.sqrt(variance) / 10));
}

function calculateMoodTrend(data) {
  if (data.length < 5) return 'stable';
  
  const recentHalf = data.slice(-Math.ceil(data.length / 2));
  const earlierHalf = data.slice(0, Math.floor(data.length / 2));
  
  const recentAvg = calculateAverageMoodScore(recentHalf);
  const earlierAvg = calculateAverageMoodScore(earlierHalf);
  
  const difference = recentAvg - earlierAvg;
  
  if (difference > 1) return 'improving';
  if (difference < -1) return 'declining';
  return 'stable';
}

function detectMoodPatterns(data) {
  const patterns = [];
  const moodCounts = {};
  const energyLow = data.filter(entry => entry.energyLevel < 4).length;
  const consecutiveLowMoods = findConsecutiveLowMoods(data);
  
  // Count mood frequencies
  data.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  
  const dominantMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
  const dominantPercent = Math.round((moodCounts[dominantMood] / data.length) * 100);
  
  patterns.push(`${dominantPercent}% of entries show ${dominantMood} mood`);
  
  if (energyLow > data.length * 0.4) {
    patterns.push(`${Math.round((energyLow/data.length)*100)}% of entries show low energy levels`);
  }
  
  if (consecutiveLowMoods >= 3) {
    patterns.push(`${consecutiveLowMoods} consecutive days of concerning moods detected`);
  }
  
  return patterns;
}

function identifyRiskFactors(recentData, weekData) {
  const risks = [];
  
  // Check for persistent low moods
  const lowMoodCount = weekData.filter(entry => ['sad', 'low', 'anxious'].includes(entry.mood)).length;
  if (lowMoodCount >= 5) {
    risks.push({
      type: 'persistent_low_mood',
      severity: 'high',
      description: 'Multiple consecutive days of low mood detected'
    });
  }
  
  // Check for low energy
  const avgEnergy = calculateAverageEnergy(weekData);
  if (avgEnergy < 4) {
    risks.push({
      type: 'low_energy',
      severity: 'medium',
      description: 'Consistently low energy levels'
    });
  }
  
  // Check for mood instability
  const stability = calculateMoodStability(recentData);
  if (stability < 0.3) {
    risks.push({
      type: 'mood_instability',
      severity: 'medium',
      description: 'High variability in mood patterns'
    });
  }
  
  // Check for stress patterns
  const stressCount = weekData.filter(entry => entry.mood === 'stressed').length;
  if (stressCount >= 4) {
    risks.push({
      type: 'chronic_stress',
      severity: 'high',
      description: 'Frequent stress episodes detected'
    });
  }
  
  return risks;
}

function identifyStrengths(data) {
  const strengths = [];
  const positiveMoods = data.filter(entry => ['excellent', 'happy', 'good'].includes(entry.mood)).length;
  const avgEnergy = calculateAverageEnergy(data);
  
  if (positiveMoods > data.length * 0.6) {
    strengths.push('Maintains positive mood frequently');
  }
  
  if (avgEnergy > 7) {
    strengths.push('Consistently high energy levels');
  }
  
  const stability = calculateMoodStability(data);
  if (stability > 0.7) {
    strengths.push('Good emotional stability');
  }
  
  if (strengths.length === 0) {
    strengths.push('Consistent self-monitoring and awareness');
  }
  
  return strengths;
}

function determineOverallWellbeing(avgMood, avgEnergy, stability, riskCount) {
  const score = (avgMood/10 + avgEnergy/10 + stability - riskCount*0.2) / 3;
  
  if (score >= 0.8) return { level: 'excellent', color: 'success', score: Math.round(score * 100) };
  if (score >= 0.6) return { level: 'good', color: 'normal', score: Math.round(score * 100) };
  if (score >= 0.4) return { level: 'concerning', color: 'mild', score: Math.round(score * 100) };
  return { level: 'needs_attention', color: 'moderate', score: Math.round(score * 100) };
}

function generatePersonalizedRecommendations(assessment, patterns, risks) {
  const recommendations = [];
  
  if (assessment.level === 'needs_attention') {
    recommendations.push('Consider speaking with a mental health professional');
    recommendations.push('Establish a daily self-care routine');
    recommendations.push('Practice stress-reduction techniques like meditation or deep breathing');
  }
  
  if (risks.some(r => r.type === 'persistent_low_mood')) {
    recommendations.push('Engage in activities that previously brought you joy');
    recommendations.push('Spend time in nature or get sunlight exposure');
    recommendations.push('Consider reaching out to trusted friends or family');
  }
  
  if (risks.some(r => r.type === 'chronic_stress')) {
    recommendations.push('Identify and address sources of chronic stress');
    recommendations.push('Practice time management and boundary setting');
    recommendations.push('Incorporate regular physical exercise into your routine');
  }
  
  if (risks.some(r => r.type === 'low_energy')) {
    recommendations.push('Evaluate your sleep patterns and aim for 7-9 hours nightly');
    recommendations.push('Consider your nutrition and hydration levels');
    recommendations.push('Schedule regular breaks throughout your day');
  }
  
  if (assessment.level === 'excellent') {
    recommendations.push('Continue your current positive practices');
    recommendations.push('Consider helping others who might be struggling');
    recommendations.push('Document what\'s working well for future reference');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring your mental health daily');
    recommendations.push('Focus on maintaining your current positive patterns');
  }
  
  return recommendations;
}

function displayAIAssessmentResults(assessment) {
  const resultsDiv = document.getElementById('aiAssessmentResults');
  
  let wellbeingClass = 'result-normal';
  let wellbeingIcon = '✅';
  
  switch(assessment.assessment.color) {
    case 'success': wellbeingClass = 'result-normal'; wellbeingIcon = '✅'; break;
    case 'normal': wellbeingClass = 'result-normal'; wellbeingIcon = '🟢'; break;
    case 'mild': wellbeingClass = 'result-mild'; wellbeingIcon = '⚠️'; break;
    case 'moderate': wellbeingClass = 'result-moderate'; wellbeingIcon = '🔴'; break;
  }
  
  resultsDiv.innerHTML = `
    <div class="result-card ${wellbeingClass}">
      <h4>${wellbeingIcon} Overall Mental Wellbeing: ${assessment.assessment.score}/100</h4>
      <p><strong>Status:</strong> ${assessment.assessment.level.replace('_', ' ').toUpperCase()}</p>
      <p><strong>Analysis Period:</strong> Last ${assessment.dataPoints} mood entries</p>
    </div>
    
    <div class="dashboard" style="margin-top: 20px;">
      <div class="card">
        <h4>📊 Detailed Metrics</h4>
        <div class="progress-item">
          <span>Average Mood Score</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(assessment.overallScore/10)*100}%"></div>
          </div>
          <span>${assessment.overallScore.toFixed(1)}/10</span>
        </div>
        <div class="progress-item">
          <span>Average Energy Level</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(assessment.energyLevel/10)*100}%"></div>
          </div>
          <span>${assessment.energyLevel.toFixed(1)}/10</span>
        </div>
        <div class="progress-item">
          <span>Emotional Stability</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${assessment.stability*100}%"></div>
          </div>
          <span>${Math.round(assessment.stability*100)}%</span>
        </div>
        <div class="progress-item">
          <span>Trend Direction</span>
          <span style="font-weight: bold; color: ${assessment.trend === 'improving' ? 'green' : assessment.trend === 'declining' ? 'red' : 'orange'}">
            ${assessment.trend.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div class="card">
        <h4>🔍 Detected Patterns</h4>
        ${assessment.patterns.length > 0 ? 
          assessment.patterns.map(pattern => `<p>• ${pattern}</p>`).join('') :
          '<p>No significant patterns detected.</p>'
        }
      </div>
    </div>
    
    ${assessment.riskFactors.length > 0 ? `
    <div class="result-card result-moderate">
      <h4>⚠️ Areas of Concern</h4>
      ${assessment.riskFactors.map(risk => 
        `<p><strong>${risk.severity.toUpperCase()}:</strong> ${risk.description}</p>`
      ).join('')}
    </div>
    ` : ''}
    
    <div class="result-card result-normal">
      <h4>💪 Your Strengths</h4>
      ${assessment.strengths.map(strength => `<p>• ${strength}</p>`).join('')}
    </div>
    
    <div class="card">
      <h4>🎯 Personalized Recommendations</h4>
      ${assessment.recommendations.map((rec, index) => 
        `<p><strong>${index + 1}.</strong> ${rec}</p>`
      ).join('')}
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 10px; border-left: 4px solid var(--primary-color);">
      <p><strong>Disclaimer:</strong> This AI assessment is based on your mood patterns and is for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. If you have concerns about your mental health, please consult with a qualified healthcare professional.</p>
    </div>
  `;
}

// Load mood data
function loadMoodData() {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  const moodLog = document.getElementById('moodLog');
  
  if (moodData.length === 0) {
    moodLog.innerHTML = '<p style="text-align: center; color: #666;">No mood entries yet. Start by logging your first mood!</p>';
    return;
  }

  const recentEntries = moodData.slice(-10).reverse();
  moodLog.innerHTML = recentEntries.map(entry => `
    <div class="progress-item">
      <div>
        <strong>${getMoodEmoji(entry.mood)} ${entry.mood}</strong>
        <div style="font-size: 0.9em; color: #666;">
          ${entry.date} at ${entry.time} • Energy: ${entry.energyLevel}/10
        </div>
        ${entry.note ? `<div style="font-size: 0.9em; margin-top: 5px;">"${entry.note}"</div>` : ''}
      </div>
    </div>
  `).join('');
}

// Get mood emoji
function getMoodEmoji(mood) {
  const emojis = {
    excellent: '🤩',
    happy: '😊',
    good: '🙂',
    neutral: '😐',
    low: '😔',
    sad: '😢',
    anxious: '😰',
    stressed: '😫'
  };
  return emojis[mood] || '😐';
}

// Update charts
function updateCharts() {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  
  if (moodData.length === 0) return;

  updateWeeklyChart(moodData);
  updateTrendsChart(moodData);
  updateMonthlyChart(moodData);
}

// Weekly chart
function updateWeeklyChart(moodData) {
  const weeklyData = getWeeklyMoodData(moodData);
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  
  if (chartInstances.weekly) {
    chartInstances.weekly.destroy();
  }

  chartInstances.weekly = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(weeklyData),
      datasets: [{
        data: Object.values(weeklyData),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
          '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Trends chart
function updateTrendsChart(moodData) {
  const last30Days = moodData.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return entryDate >= thirtyDaysAgo;
  });

  const dailyAverages = getDailyMoodAverages(last30Days);
  const ctx = document.getElementById('trendsChart').getContext('2d');
  
  if (chartInstances.trends) {
    chartInstances.trends.destroy();
  }

  chartInstances.trends = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyAverages.labels,
      datasets: [{
        label: 'Mood Trend',
        data: dailyAverages.values,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

// Monthly chart
function updateMonthlyChart(moodData) {
  const monthlyData = getMonthlyMoodData(moodData);
  const ctx = document.getElementById('monthlyChart');
  
  if (!ctx) return;
  
  if (chartInstances.monthly) {
    chartInstances.monthly.destroy();
  }

  chartInstances.monthly = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Monthly Mood Distribution',
        data: Object.values(monthlyData),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
          '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ],
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Helper functions for chart data
function getWeeklyMoodData(moodData) {
  const weekData = {};
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  moodData.forEach(entry => {
    const entryDate = new Date(entry.timestamp);
    if (entryDate >= oneWeekAgo) {
      weekData[entry.mood] = (weekData[entry.mood] || 0) + 1;
    }
  });
  
  return weekData;
}

function getMonthlyMoodData(moodData) {
  const monthData = {};
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  moodData.forEach(entry => {
    const entryDate = new Date(entry.timestamp);
    if (entryDate >= oneMonthAgo) {
      monthData[entry.mood] = (monthData[entry.mood] || 0) + 1;
    }
  });
  
  return monthData;
}

function getDailyMoodAverages(moodData) {
  const dailyData = {};
  const moodScores = {
    'excellent': 10, 'happy': 8, 'good': 7, 'neutral': 5,
    'low': 3, 'sad': 2, 'anxious': 3, 'stressed': 2
  };
  
  moodData.forEach(entry => {
    const date = new Date(entry.timestamp).toDateString();
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(moodScores[entry.mood] || 5);
  });
  
  const labels = [];
  const values = [];
  
  Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
    const scores = dailyData[date];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    labels.push(new Date(date).toLocaleDateString());
    values.push(average);
  });
  
  return { labels, values };
}

// Helper functions
function findConsecutiveLowMoods(data) {
  const lowMoods = ['sad', 'low', 'anxious', 'stressed'];
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  
  data.forEach(entry => {
    if (lowMoods.includes(entry.mood)) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  });
  
  return maxConsecutive;
}

function getRecentMoods(days) {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return moodData.filter(entry => new Date(entry.timestamp) >= cutoffDate);
}

function getMostFrequentMood(moods) {
  const counts = {};
  moods.forEach(entry => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Initialize assessments
function initializeAssessments() {
  createAssessmentQuestions('phq9Assessment', phq9Questions, 'phq9');
  createAssessmentQuestions('gad7Assessment', gad7Questions, 'gad7');
}

function createAssessmentQuestions(containerId, questions, prefix) {
  const container = document.getElementById(containerId);
  const questionsHtml = questions.map((question, index) => `
    <div class="question-group">
      <h4>${question}</h4>
      <div class="rating-scale">
        ${ratingLabels.map((label, rating) => `
          <label title="${label}">
            <input type="radio" name="${prefix}_q${index}" value="${rating}" style="display: none;">
            <div class="rating-btn">${rating}</div>
          </label>
        `).join('')}
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 0.8em; color: #666;">
        <span>Not at all</span>
        <span>Nearly every day</span>
      </div>
    </div>
  `).join('');
  
  container.innerHTML += questionsHtml;
  
  // Add event listeners for rating buttons
  container.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      input.checked = true;
      
      // Remove selected class from siblings
      this.parentElement.parentElement.querySelectorAll('.rating-btn').forEach(sibling => {
        sibling.classList.remove('selected');
      });
      
      // Add selected class to clicked button
      this.classList.add('selected');
    });
  });
}

function calculateAssessment() {
  const phq9Scores = [];
  const gad7Scores = [];
  
  // Get PHQ-9 scores
  for (let i = 0; i < phq9Questions.length; i++) {
    const selected = document.querySelector(`input[name="phq9_q${i}"]:checked`);
    if (selected) {
      phq9Scores.push(parseInt(selected.value));
    }
  }
  
  // Get GAD-7 scores
  for (let i = 0; i < gad7Questions.length; i++) {
    const selected = document.querySelector(`input[name="gad7_q${i}"]:checked`);
    if (selected) {
      gad7Scores.push(parseInt(selected.value));
    }
  }
  
  if (phq9Scores.length !== phq9Questions.length || gad7Scores.length !== gad7Questions.length) {
    showNotification('Please answer all questions before calculating results.', 'warning');
    return;
  }
  
  const phq9Total = phq9Scores.reduce((sum, score) => sum + score, 0);
  const gad7Total = gad7Scores.reduce((sum, score) => sum + score, 0);
  
  displayAssessmentResults(phq9Total, gad7Total);
}

function displayAssessmentResults(phq9Score, gad7Score) {
  const resultsDiv = document.getElementById('assessmentResults');
  
  const phq9Result = interpretPHQ9Score(phq9Score);
  const gad7Result = interpretGAD7Score(gad7Score);
  
  resultsDiv.innerHTML = `
    <div class="result-card ${phq9Result.class}">
      <h4>Depression Assessment (PHQ-9)</h4>
      <p><strong>Score: ${phq9Score}/27</strong></p>
      <p><strong>Severity: ${phq9Result.severity}</strong></p>
      <p>${phq9Result.description}</p>
    </div>
    
    <div class="result-card ${gad7Result.class}">
      <h4>Anxiety Assessment (GAD-7)</h4>
      <p><strong>Score: ${gad7Score}/21</strong></p>
      <p><strong>Severity: ${gad7Result.severity}</strong></p>
      <p>${gad7Result.description}</p>
    </div>
    
    <div class="card">
      <h4>Recommendations</h4>
      ${getAssessmentRecommendations(phq9Result, gad7Result)}
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: rgba(102, 126, 234, 0.1); border-radius: 10px; border-left: 4px solid var(--primary-color);">
      <p><strong>Important:</strong> These assessments are screening tools only and cannot diagnose mental health conditions. If your results suggest moderate to severe symptoms, or if you're having thoughts of self-harm, please consult with a mental health professional immediately.</p>
    </div>
  `;
}

function interpretPHQ9Score(score) {
  if (score >= 20) return { severity: 'Severe', class: 'result-severe', description: 'Severe depression symptoms detected. Professional help is strongly recommended.' };
  if (score >= 15) return { severity: 'Moderately Severe', class: 'result-moderate', description: 'Moderately severe depression symptoms. Consider seeking professional support.' };
  if (score >= 10) return { severity: 'Moderate', class: 'result-moderate', description: 'Moderate depression symptoms. Professional consultation may be beneficial.' };
  if (score >= 5) return { severity: 'Mild', class: 'result-mild', description: 'Mild depression symptoms. Monitor your mood and consider self-care strategies.' };
  return { severity: 'Minimal', class: 'result-normal', description: 'Minimal depression symptoms. Continue maintaining good mental health practices.' };
}

function interpretGAD7Score(score) {
  if (score >= 15) return { severity: 'Severe', class: 'result-severe', description: 'Severe anxiety symptoms detected. Professional help is strongly recommended.' };
  if (score >= 10) return { severity: 'Moderate', class: 'result-moderate', description: 'Moderate anxiety symptoms. Consider seeking professional support.' };
  if (score >= 5) return { severity: 'Mild', class: 'result-mild', description: 'Mild anxiety symptoms. Practice anxiety management techniques.' };
  return { severity: 'Minimal', class: 'result-normal', description: 'Minimal anxiety symptoms. Continue maintaining good mental health practices.' };
}

function getAssessmentRecommendations(phq9Result, gad7Result) {
  const recommendations = [];
  
  if (phq9Result.severity !== 'Minimal' || gad7Result.severity !== 'Minimal') {
    recommendations.push('Consider speaking with a mental health professional');
    recommendations.push('Practice daily self-care activities');
    recommendations.push('Maintain regular exercise and healthy sleep patterns');
  }
  
  if (phq9Result.severity === 'Moderate' || phq9Result.severity === 'Moderately Severe' || phq9Result.severity === 'Severe') {
    recommendations.push('Engage in activities you previously enjoyed');
    recommendations.push('Connect with supportive friends and family');
    recommendations.push('Consider therapy or counseling services');
  }
  
  if (gad7Result.severity === 'Moderate' || gad7Result.severity === 'Severe') {
    recommendations.push('Practice relaxation techniques like deep breathing');
    recommendations.push('Try mindfulness or meditation exercises');
    recommendations.push('Limit caffeine and alcohol consumption');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue your current positive mental health practices');
    recommendations.push('Regular mood monitoring helps maintain awareness');
  }
  
  return recommendations.map((rec, index) => `<p><strong>${index + 1}.</strong> ${rec}</p>`).join('');
}

// Analytics functions
function updateAnalytics() {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  
  if (moodData.length === 0) {
    document.getElementById('moodInsights').innerHTML = '<p>No data available for analysis yet.</p>';
    return;
  }
  
  const insights = generateMoodInsights(moodData);
  displayMoodInsights(insights);
  displayPatternAnalysis(moodData);
}

function generateMoodInsights(moodData) {
  const recentData = moodData.slice(-30);
  const avgMood = calculateAverageMoodScore(recentData);
  const avgEnergy = calculateAverageEnergy(recentData);
  const mostCommonMood = getMostCommonMood(recentData);
  const moodVariability = calculateMoodStability(recentData);
  
  return {
    totalEntries: moodData.length,
    recentEntries: recentData.length,
    averageMood: avgMood,
    averageEnergy: avgEnergy,
    mostCommonMood: mostCommonMood,
    moodStability: moodVariability,
    streak: calculateCurrentStreak(moodData)
  };
}

function getMostCommonMood(data) {
  const counts = {};
  data.forEach(entry => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function calculateCurrentStreak(data) {
  if (data.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  
  for (let i = data.length - 1; i >= 0; i--) {
    const entryDate = new Date(data[i].timestamp);
    const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function displayMoodInsights(insights) {
  const insightsDiv = document.getElementById('moodInsights');
  
  insightsDiv.innerHTML = `
    <div class="insight-card">
      <h4>📈 Your Mental Health Journey</h4>
      <p>You've been tracking your mood for ${insights.totalEntries} days! Keep up the great work.</p>
    </div>
    
    <div class="progress-item">
      <span>Current Logging Streak</span>
      <span style="font-size: 1.2em; font-weight: bold;">${insights.streak} days</span>
    </div>
    
    <div class="progress-item">
      <span>Average Mood Score (Last 30 days)</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(insights.averageMood/10)*100}%"></div>
      </div>
      <span>${insights.averageMood.toFixed(1)}/10</span>
    </div>
    
    <div class="progress-item">
      <span>Average Energy Level</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(insights.averageEnergy/10)*100}%"></div>
      </div>
      <span>${insights.averageEnergy.toFixed(1)}/10</span>
    </div>
    
    <div class="progress-item">
      <span>Most Common Mood</span>
      <span style="font-size: 1.2em;">${getMoodEmoji(insights.mostCommonMood)} ${insights.mostCommonMood}</span>
    </div>
    
    <div class="progress-item">
      <span>Emotional Stability</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${insights.moodStability*100}%"></div>
      </div>
      <span>${Math.round(insights.moodStability*100)}%</span>
    </div>
  `;
}

function displayPatternAnalysis(moodData) {
  const patterns = analyzeDetailedPatterns(moodData);
  const analysisDiv = document.getElementById('patternAnalysis');
  
  analysisDiv.innerHTML = `
    <h4>🔍 Pattern Detection Results</h4>
    ${patterns.map(pattern => `
      <div class="insight-card">
        <h4>${pattern.title}</h4>
        <p>${pattern.description}</p>
        ${pattern.recommendation ? `<p><strong>Tip:</strong> ${pattern.recommendation}</p>` : ''}
      </div>
    `).join('')}
  `;
}

function analyzeDetailedPatterns(moodData) {
  const patterns = [];
  const recentWeek = moodData.slice(-7);
  
  // Weekend vs weekday analysis
  const weekendMoods = [];
  const weekdayMoods = [];
  
  moodData.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendMoods.push(entry);
    } else {
      weekdayMoods.push(entry);
    }
  });
  
  if (weekendMoods.length > 0 && weekdayMoods.length > 0) {
    const weekendAvg = calculateAverageMoodScore(weekendMoods);
    const weekdayAvg = calculateAverageMoodScore(weekdayMoods);
    
    if (weekendAvg > weekdayAvg + 1) {
      patterns.push({
        title: '📅 Weekend Boost Detected',
        description: `Your mood tends to be better on weekends (${weekendAvg.toFixed(1)}/10) compared to weekdays (${weekdayAvg.toFixed(1)}/10).`,
        recommendation: 'Try to incorporate more weekend-like relaxation into your weekdays.'
      });
    } else if (weekdayAvg > weekendAvg + 1) {
      patterns.push({
        title: '💼 Weekday Warrior Pattern',
        description: `You seem to thrive during weekdays (${weekdayAvg.toFixed(1)}/10) more than weekends (${weekendAvg.toFixed(1)}/10).`,
        recommendation: 'Consider planning more structured activities for weekends.'
      });
    }
  }
  
  // Energy-mood correlation
  const energyMoodCorrelation = calculateEnergyMoodCorrelation(moodData);
  if (energyMoodCorrelation > 0.7) {
    patterns.push({
      title: '⚡ Strong Energy-Mood Connection',
      description: 'Your energy levels and mood are highly correlated. When your energy is high, your mood tends to be better.',
      recommendation: 'Focus on activities that boost your energy levels, such as regular exercise and good sleep.'
    });
  }
  
  // Recent trend analysis
  if (recentWeek.length >= 5) {
    const trend = calculateMoodTrend(recentWeek);
    if (trend === 'improving') {
      patterns.push({
        title: '📈 Positive Trend Detected',
        description: 'Your mood has been improving over the past week. Great job!',
        recommendation: 'Keep doing what you\'re doing - identify what\'s working and continue those practices.'
      });
    } else if (trend === 'declining') {
      patterns.push({
        title: '📉 Concerning Trend',
        description: 'Your mood has been declining over the past week.',
        recommendation: 'Consider what changes occurred recently and focus on self-care activities.'
      });
    }
  }
  
  if (patterns.length === 0) {
    patterns.push({
      title: '📊 Stable Patterns',
      description: 'Your mood patterns appear stable with no significant trends detected.',
      recommendation: 'Continue your current approach to mental health monitoring.'
    });
  }
  
  return patterns;
}

function calculateEnergyMoodCorrelation(data) {
  if (data.length < 3) return 0;
  
  const moodScores = data.map(entry => {
    const scores = { 'excellent': 10, 'happy': 8, 'good': 7, 'neutral': 5, 'low': 3, 'sad': 2, 'anxious': 3, 'stressed': 2 };
    return scores[entry.mood] || 5;
  });
  
  const energyLevels = data.map(entry => entry.energyLevel || 5);
  
  const moodMean = moodScores.reduce((a, b) => a + b) / moodScores.length;
  const energyMean = energyLevels.reduce((a, b) => a + b) / energyLevels.length;
  
  let numerator = 0;
  let moodSumSq = 0;
  let energySumSq = 0;
  
  for (let i = 0; i < moodScores.length; i++) {
    const moodDiff = moodScores[i] - moodMean;
    const energyDiff = energyLevels[i] - energyMean;
    
    numerator += moodDiff * energyDiff;
    moodSumSq += moodDiff * moodDiff;
    energySumSq += energyDiff * energyDiff;
  }
  
  const denominator = Math.sqrt(moodSumSq * energySumSq);
  
  return denominator === 0 ? 0 : numerator / denominator;
}

// Progress tracking
function updateProgress() {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  const progressDiv = document.getElementById('progressTracking');
  
  if (moodData.length === 0) {
    progressDiv.innerHTML = '<p>Start logging your mood to track your progress!</p>';
    return;
  }
  
  const progressMetrics = calculateProgressMetrics(moodData);
  displayProgressMetrics(progressMetrics);
}

function calculateProgressMetrics(moodData) {
  const totalDays = moodData.length;
  const last30Days = moodData.slice(-30);
  const last7Days = moodData.slice(-7);
  
  return {
    totalDays: totalDays,
    consistency: Math.min(100, (totalDays / 30) * 100), // Assume 30 days is 100% consistency
    averageMoodLast30: calculateAverageMoodScore(last30Days),
    averageMoodLast7: calculateAverageMoodScore(last7Days),
    positiveDaysLast30: last30Days.filter(entry => ['excellent', 'happy', 'good'].includes(entry.mood)).length,
    improvementTrend: calculateMoodTrend(last30Days)
  };
}

function displayProgressMetrics(metrics) {
  const progressDiv = document.getElementById('progressTracking');
  
  progressDiv.innerHTML = `
    <div class="insight-card">
      <h4>🎯 Your Mental Health Progress</h4>
      <p>You've been consistently tracking your mental health for ${metrics.totalDays} days. Here's your progress overview:</p>
    </div>
    
    <div class="progress-item">
      <span>Tracking Consistency</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.min(metrics.consistency, 100)}%"></div>
      </div>
      <span>${Math.round(metrics.consistency)}%</span>
    </div>
    
    <div class="progress-item">
      <span>30-Day Average Mood</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(metrics.averageMoodLast30/10)*100}%"></div>
      </div>
      <span>${metrics.averageMoodLast30.toFixed(1)}/10</span>
    </div>
    
    <div class="progress-item">
      <span>7-Day Average Mood</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(metrics.averageMoodLast7/10)*100}%"></div>
      </div>
      <span>${metrics.averageMoodLast7.toFixed(1)}/10</span>
    </div>
    
    <div class="progress-item">
      <span>Positive Days (Last 30)</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(metrics.positiveDaysLast30/30)*100}%"></div>
      </div>
      <span>${metrics.positiveDaysLast30}/30 days</span>
    </div>
    
    <div class="progress-item">
      <span>Trend Direction</span>
      <span style="font-weight: bold; color: ${metrics.improvementTrend === 'improving' ? 'green' : metrics.improvementTrend === 'declining' ? 'red' : 'orange'}">
        ${metrics.improvementTrend.toUpperCase()}
      </span>
    </div>
    
    <div class="card" style="margin-top: 20px;">
      <h4>🏆 Achievements</h4>
      ${generateAchievements(metrics)}
    </div>
  `;
}

function generateAchievements(metrics) {
  const achievements = [];
  
  if (metrics.totalDays >= 7) achievements.push('🎉 First Week Complete!');
  if (metrics.totalDays >= 30) achievements.push('🏅 One Month Milestone!');
  if (metrics.totalDays >= 90) achievements.push('⭐ Three Month Champion!');
  if (metrics.consistency >= 80) achievements.push('📅 Consistency Master!');
  if (metrics.averageMoodLast30 >= 7) achievements.push('😊 Positive Mindset Maintainer!');
  if (metrics.improvementTrend === 'improving') achievements.push('📈 Upward Trajectory!');
  
  if (achievements.length === 0) {
    achievements.push('🌱 Mental Health Journey Started!');
  }
  
  return achievements.map(achievement => `<p>${achievement}</p>`).join('');
}

// Resources
function loadResources() {
  const resourcesGrid = document.getElementById('resourcesGrid');
  
  const resources = [
    {
      title: 'Crisis Hotlines',
      description: 'Immediate help when you need it most',
      content: '988 - Suicide & Crisis Lifeline\nText "HELLO" to 741741 - Crisis Text Line\nCall 1-800-366-8288 - Self-Injury Outreach & Support'
    },
    {
      title: 'Mindfulness & Meditation',
      description: 'Apps and techniques for mental wellness',
      content: 'Try guided meditation apps like Headspace or Calm\nPractice deep breathing exercises\n5-minute daily mindfulness breaks'
    },
    {
      title: 'Professional Help',
      description: 'Finding the right mental health support',
      content: 'Psychology Today therapist finder\nYour healthcare provider\'s mental health services\nEmployee Assistance Programs (EAP) if available'
    },
    {
      title: 'Self-Care Activities',
      description: 'Daily practices for better mental health',
      content: 'Regular exercise routine\nHealthy sleep schedule (7-9 hours)\nJournaling and mood tracking\nConnecting with loved ones'
    },
    {
      title: 'Online Support',
      description: 'Communities and additional resources',
      content: 'NAMI (National Alliance on Mental Illness)\nMental Health America\nAnxiety and Depression Association of America'
    },
    {
      title: 'Emergency Resources',
      description: 'When to seek immediate help',
      content: 'If you have thoughts of self-harm\nSevere depression lasting 2+ weeks\nPanic attacks interfering with daily life\nSubstance abuse concerns'
    }
  ];
  
  resourcesGrid.innerHTML = resources.map(resource => `
    <div class="resource-card">
      <h4>${resource.title}</h4>
      <p style="margin-bottom: 15px; color: #666;">${resource.description}</p>
      <div style="white-space: pre-line; font-size: 0.9em;">
        ${resource.content}
      </div>
    </div>
  `).join('');
}

// Utility functions
function createMoodBubble(mood) {
  const bubble = document.createElement('div');
  bubble.className = 'mood-bubble';
  bubble.textContent = getMoodEmoji(mood);
  bubble.style.left = Math.random() * (window.innerWidth - 60) + 'px';
  bubble.style.bottom = '20px';
  
  document.body.appendChild(bubble);
  
  setTimeout(() => {
    if (bubble.parentNode) {
      bubble.parentNode.removeChild(bubble);
    }
  }, 3000);
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function showPersonalizedTip(moodEntry) {
  const tips = {
    excellent: "You're radiating positivity today! ✨",
    happy: "Keep that beautiful smile! 😊",
    good: "You're doing great! Keep it up! 👍",
    neutral: "It's okay to have neutral days. Be kind to yourself. 🤗",
    low: "This feeling is temporary. You're stronger than you know. 💪",
    sad: "It's okay to feel sad. Your feelings are valid. 🫂",
    anxious: "Take deep breaths. You've got this. 🌸",
    stressed: "Remember to take breaks. You matter. 🌿"
  };
  
  const tip = tips[moodEntry.mood] || "Thank you for checking in with yourself today.";
  showNotification(tip, 'success');
}

// Data export/import functions
function exportData() {
  const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
  const assessmentData = JSON.parse(localStorage.getItem('assessmentData')) || [];
  
  const exportData = {
    moodData: moodData,
    assessmentData: assessmentData,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `mental-health-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Data exported successfully!', 'success');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (importedData.moodData && Array.isArray(importedData.moodData)) {
        localStorage.setItem('moodData', JSON.stringify(importedData.moodData));
        loadMoodData();
        updateCharts();
        showNotification('Data imported successfully!', 'success');
      } else {
        showNotification('Invalid data format!', 'error');
      }
    } catch (error) {
      showNotification('Error reading file!', 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}