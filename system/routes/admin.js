const express = require("express");
const router = express.Router();

// Admin PIN - 198970
const ADMIN_PIN = "198970";

// Feature toggles with descriptions (30+ features)
const features = {
  // AI Features
  chatgpt: { name: "ChatGPT Integration", description: "Enable ChatGPT AI responses", icon: "⚡", enabled: true, category: "AI" },
  gemini: { name: "Gemini Integration", description: "Enable Google Gemini AI responses", icon: "🔮", enabled: true, category: "AI" },
  aiGuard: { name: "AI Guard Message Control", description: "Block user messages when enabled", icon: "🛡️", enabled: false, category: "AI" },
  aiImageGen: { name: "AI Image Generation", description: "Enable image generation features", icon: "🎨", enabled: false, category: "AI" },
  aiTranslate: { name: "AI Translation", description: "Translate messages to any language", icon: "🌐", enabled: false, category: "AI" },
  aiVoice: { name: "AI Voice Recognition", description: "Convert speech to text", icon: "🎤", enabled: false, category: "AI" },
  // Commerce
  payments: { name: "Payment System", description: "Enable GCash & Maya payments", icon: "💳", enabled: false, category: "Commerce" },
  trial: { name: "Trial System", description: "Enable free trial features", icon: "🎁", enabled: false, category: "Commerce" },
  premium: { name: "Premium Features", description: "Enable exclusive pro features", icon: "👑", enabled: false, category: "Commerce" },
  subscriptions: { name: "Subscriptions", description: "Monthly/yearly subscription plans", icon: "🔄", enabled: false, category: "Commerce" },
  coupons: { name: "Coupon System", description: "Apply discount codes", icon: "🎟️", enabled: false, category: "Commerce" },
  // Dashboard & Analytics
  analytics: { name: "Analytics Dashboard", description: "Track user visits and stats", icon: "📊", enabled: true, category: "Dashboard" },
  profiling: { name: "User Profiling", description: "Collect user behavior data", icon: "👤", enabled: false, category: "Dashboard" },
  logsViewer: { name: "Logs Viewer", description: "View user activity logs", icon: "📋", enabled: true, category: "Dashboard" },
  userStats: { name: "User Statistics", description: "Detailed user engagement stats", icon: "📈", enabled: true, category: "Dashboard" },
  sessionTracker: { name: "Session Tracker", description: "Monitor active user sessions", icon: "👥", enabled: false, category: "Dashboard" },
  // UI & UX
  darkMode: { name: "Dark Mode", description: "Enable dark theme support", icon: "🌙", enabled: true, category: "UI" },
  autoSave: { name: "Auto Save", description: "Automatically save chat history", icon: "💾", enabled: true, category: "UI" },
  notifications: { name: "Push Notifications", description: "Enable browser notifications", icon: "🔔", enabled: false, category: "UI" },
  customThemes: { name: "Custom Themes", description: "Allow users to pick custom colors", icon: "🎨", enabled: false, category: "UI" },
  soundEffects: { name: "Sound Effects", description: "Enable notification sounds", icon: "🔊", enabled: true, category: "UI" },
  animations: { name: "Smooth Animations", description: "Enable UI animations", icon: "✨", enabled: true, category: "UI" },
  // Security & Moderation
  contentFilter: { name: "Content Filter", description: "Filter inappropriate messages", icon: "🚫", enabled: true, category: "Security" },
  twoFactor: { name: "Two-Factor Auth", description: "Require 2FA for login", icon: "🔐", enabled: false, category: "Security" },
  rateLimit: { name: "Rate Limiting", description: "Limit messages per user", icon: "⏱️", enabled: true, category: "Security" },
  ipBanning: { name: "IP Banning", description: "Block suspicious IPs", icon: "🚨", enabled: false, category: "Security" },
  // Features & Tools
  chatHistory: { name: "Chat History", description: "Save and retrieve conversations", icon: "💬", enabled: true, category: "Features" },
  fileUpload: { name: "File Upload", description: "Allow file sharing", icon: "📁", enabled: false, category: "Features" },
  voiceChat: { name: "Voice Chat", description: "Enable voice communication", icon: "☎️", enabled: false, category: "Features" },
  videoChat: { name: "Video Chat", description: "Enable video communication", icon: "📹", enabled: false, category: "Features" },
  collaboration: { name: "Collaboration Tools", description: "Real-time collaboration features", icon: "🤝", enabled: false, category: "Features" },
  // GitHub Integration
  githubConnect: { name: "GitHub Account Connect", description: "Allow users to connect GitHub account", icon: "🔗", enabled: false, category: "GitHub" },
  githubRepoCreate: { name: "Repository Creation", description: "Create new repositories from dashboard", icon: "📦", enabled: false, category: "GitHub" },
  githubRepoManage: { name: "Repository Management", description: "Manage repositories and settings", icon: "⚙️", enabled: false, category: "GitHub" },
  githubCodePush: { name: "Code Push to GitHub", description: "Push code directly from chat", icon: "📤", enabled: false, category: "GitHub" },
  githubCommit: { name: "Auto Commit", description: "Automatic commit and push logs", icon: "✅", enabled: false, category: "GitHub" },
  githubBranch: { name: "Branch Management", description: "Create and manage git branches", icon: "🌿", enabled: false, category: "GitHub" }
};

// Simple CAPTCHA verification
function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Store active CAPTCHAs in memory (with 5 minute expiry)
let activeCaptchas = {};

// Verify admin PIN with CAPTCHA
const verifyAdminPin = (req, res, next) => {
  const { pin, captcha, captchaId } = req.query || req.body;
  
  if (!pin || !captcha || !captchaId) {
    return res.status(400).json({ error: "Missing PIN or CAPTCHA" });
  }
  
  if (pin !== ADMIN_PIN) {
    return res.status(401).json({ error: "Invalid admin PIN" });
  }
  
  if (!activeCaptchas[captchaId] || activeCaptchas[captchaId] !== captcha.toUpperCase()) {
    return res.status(401).json({ error: "Invalid CAPTCHA" });
  }
  
  delete activeCaptchas[captchaId];
  next();
};

// Generate CAPTCHA for admin login
router.get("/captcha", (req, res) => {
  const captchaId = Date.now().toString();
  const code = generateCaptcha();
  activeCaptchas[captchaId] = code;
  
  // Expire CAPTCHA after 5 minutes
  setTimeout(() => delete activeCaptchas[captchaId], 5 * 60 * 1000);
  
  res.json({ 
    captchaId, 
    // In production, this should be an image, but for now return text
    message: `Your CAPTCHA is: ${code}` 
  });
});

// Get all features
router.get("/features", verifyAdminPin, (req, res) => {
  res.json(features);
});

// Toggle feature
router.post("/features/:featureKey/toggle", verifyAdminPin, (req, res) => {
  const { featureKey } = req.params;
  if (features[featureKey]) {
    features[featureKey].enabled = !features[featureKey].enabled;
    res.json({ success: true, feature: featureKey, enabled: features[featureKey].enabled });
  } else {
    res.status(404).json({ error: "Feature not found" });
  }
});

// Get single feature status
router.get("/features/:featureKey", verifyAdminPin, (req, res) => {
  const { featureKey } = req.params;
  if (features[featureKey]) {
    res.json(features[featureKey]);
  } else {
    res.status(404).json({ error: "Feature not found" });
  }
});

// System info
router.get("/system", verifyAdminPin, (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeHours = Math.floor(uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
  
  const mem = process.memoryUsage();
  res.json({
    status: "online",
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    memory: {
      used: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`
    },
    version: "1.0.0",
    timestamp: new Date().toLocaleString()
  });
});

// Get system status
router.get("/status", (req, res) => {
  res.json({ 
    status: "online", 
    features: Object.keys(features).reduce((acc, key) => {
      acc[key] = features[key].enabled;
      return acc;
    }, {})
  });
});

// In-memory logs (in production, use database)
const userLogs = [];

// Log user activity
router.post("/log", (req, res) => {
  const { username, action, timestamp } = req.body;
  if (username) {
    userLogs.push({
      username,
      action: action || "visited",
      timestamp: timestamp || new Date().toISOString(),
      id: userLogs.length + 1
    });
  }
  res.json({ success: true });
});

// Get user logs
router.get("/logs", verifyAdminPin, (req, res) => {
  const logs = userLogs.slice(-100).reverse(); // Last 100 logs
  res.json(logs);
});

// Clear logs
router.post("/logs/clear", verifyAdminPin, (req, res) => {
  userLogs.length = 0;
  res.json({ success: true, message: "Logs cleared" });
});

module.exports = router;
