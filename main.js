const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const loadAll = require("./system/utility/loadAll");
const { install } = require("./system/utility/install");

// Load config.json
const api = require("./json/api.json")
const config = require("./json/config.json");
global.api = api;
global.config = config;
const { prefix } = config;

global.client = {
  commands: new Map(),
  events: new Map(),
};

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "macky-ai-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

loadAll()

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "system", "public")));

// Auth routes
const authRoutes = require("./system/routes/auth");
app.use("/auth", authRoutes);

const { listen } = require("./system/listen");
listen({ app });
install();

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
