const express = require("express");
const router = express.Router();

// Admin PIN - 1989
const ADMIN_PIN = "1989";

// Feature toggles - stored in memory (use database for persistence)
const features = {
  chatgpt: { name: "ChatGPT Integration", enabled: true },
  gemini: { name: "Gemini Integration", enabled: true },
  payments: { name: "Payment System", enabled: false },
  trial: { name: "Trial System", enabled: false },
  analytics: { name: "Analytics Dashboard", enabled: true },
  profiling: { name: "User Profiling", enabled: false },
  darkness: { name: "Dark Mode", enabled: true },
  autoSave: { name: "Auto Save", enabled: true }
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
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0",
    timestamp: new Date()
  });
});

module.exports = router;
