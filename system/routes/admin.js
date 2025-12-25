const express = require("express");
const router = express.Router();

// Admin PIN - 1989
const ADMIN_PIN = "1989";

// Feature toggles with descriptions
const features = {
  chatgpt: { name: "ChatGPT Integration", description: "Enable ChatGPT AI responses", icon: "⚡", enabled: true, category: "AI" },
  gemini: { name: "Gemini Integration", description: "Enable Google Gemini AI responses", icon: "🔮", enabled: true, category: "AI" },
  payments: { name: "Payment System", description: "Enable GCash & Maya payments", icon: "💳", enabled: false, category: "Commerce" },
  trial: { name: "Trial System", description: "Enable free trial features", icon: "🎁", enabled: false, category: "Commerce" },
  analytics: { name: "Analytics Dashboard", description: "Track user visits and stats", icon: "📊", enabled: true, category: "Dashboard" },
  profiling: { name: "User Profiling", description: "Collect user behavior data", icon: "👤", enabled: false, category: "Dashboard" },
  darkMode: { name: "Dark Mode", description: "Enable dark theme support", icon: "🌙", enabled: true, category: "UI" },
  autoSave: { name: "Auto Save", description: "Automatically save chat history", icon: "💾", enabled: true, category: "UI" },
  notifications: { name: "Push Notifications", description: "Enable browser notifications", icon: "🔔", enabled: false, category: "UI" },
  premium: { name: "Premium Features", description: "Enable exclusive pro features", icon: "👑", enabled: false, category: "Commerce" }
};

// Verify admin PIN
const verifyAdminPin = (req, res, next) => {
  const { pin } = req.query || req.body;
  if (pin === ADMIN_PIN) {
    next();
  } else {
    res.status(401).json({ error: "Invalid admin PIN" });
  }
};

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

module.exports = router;
