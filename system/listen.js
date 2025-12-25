// system/listen.js
const path = require("path");
const { command } = require("./handle/command.js");
const { event } = require("./handle/event.js");
const { createWataru } = require("./utility/wataru");
const { dbGet, dbRun, checkSession, generateToken } = require("./utility/auth.js");

exports.listen = async function ({ app }) {
  // Command endpoint with session validation.
  app.get("/api/command", async (req, res) => {
    try {
      const { chatId, chatType, messageId, session } = req.query;
      await checkSession(session);
      const msg = {
        chat: { id: chatId || "defaultChatId", type: chatType || "private" },
        message_id: messageId || 1,
      };
      const wataru = createWataru(res, msg);
      await command({ req, wataru, msg });
    } catch (error) {
      console.error("Error in /api/command:", error);
      res.status(401).json({
        fail: true,
        message: error.message || "An error occurred while executing the command.",
      });
    }
  });

  // Event endpoint with session validation.
  app.get("/api/event", async (req, res) => {
    try {
      const { chatId, chatType, messageId, eventName, session, ...data } = req.query;
      if (!eventName) {
        return res.status(400).json({ fail: true, message: "No event specified." });
      }
      await checkSession(session);
      const msg = {
        chat: { id: chatId || "defaultChatId", type: chatType || "private" },
        message_id: messageId || 1,
      };
      const wataru = createWataru(res, msg);
      await event({ req, wataru, msg, data });
    } catch (error) {
      console.error("Error in /api/event:", error);
      res.status(401).json({
        fail: true,
        message: error.message || "An error occurred while processing the event.",
      });
    }
  });

  // Endpoint to list all commands.
  app.get("/api/commands", (req, res) => {
    try {
      const commandList = Array.from(global.client.commands.values()).map((cmd) => ({
        name: cmd.meta.name,
        description: cmd.meta.description || "No description available",
        prefix: cmd.meta.prefix,
      }));
      res.json(commandList);
    } catch (error) {
      console.error("Error in /api/commands:", error);
      res.status(500).json({ fail: true, message: "An error occurred while retrieving commands." });
    }
  });

  // Create Account endpoint.
  app.post("/api/create-account", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) {
        return res.status(400).json({ fail: true, message: "Username and password are required." });
      }
      // In production, hash the password before storing.
      await dbRun("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [
        username,
        password,
        email || null,
      ]);
      res.json({ fail: false, message: "Account created successfully." });
    } catch (error) {
      console.error("Error in /api/create-account:", error);
      res.status(500).json({ fail: true, message: "An error occurred while creating the account." });
    }
  });

  // Login endpoint.
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ fail: true, message: "Username and password are required." });
      }
      // In production, compare hashed passwords.
      const user = await dbGet("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
      if (!user) {
        return res.status(401).json({ fail: true, message: "Invalid credentials." });
      }
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await dbRun("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)", [user.id, token, expiresAt]);
      res.json({ fail: false, session: token, expiresAt, message: "Login successful." });
    } catch (error) {
      console.error("Error in /api/login:", error);
      res.status(500).json({ fail: true, message: "An error occurred while logging in." });
    }
  });

  // Serve index.html for the root route.
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
};
