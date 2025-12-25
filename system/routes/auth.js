const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const router = express.Router();

// Configure Passport strategies
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "default_google_id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "default_google_secret",
    callbackURL: "/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      provider: 'google',
      avatar: profile.photos[0]?.value
    };
    return done(null, user);
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || "default_github_id",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "default_github_secret",
    callbackURL: "/auth/github/callback"
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      name: profile.displayName || profile.username,
      email: profile.emails[0]?.value,
      provider: 'github',
      avatar: profile.photos[0]?.value
    };
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth routes
router.get("/google", 
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.json({ success: true, user: req.user });
  }
);

// GitHub OAuth routes
router.get("/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.json({ success: true, user: req.user });
  }
);

// Regular login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    req.session.user = { username, id: Date.now() };
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(400).json({ error: "Invalid credentials" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
router.get("/status", (req, res) => {
  res.json({ authenticated: !!req.session.user, user: req.session.user });
});

// Server restart (development only)
router.post("/restart", (req, res) => {
  res.json({ message: "Server restart initiated. Please refresh the page." });
  setTimeout(() => process.exit(0), 1000);
});

module.exports = router;
