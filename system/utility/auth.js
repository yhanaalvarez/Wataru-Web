// system/utility/auth.js
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const path = require("path");

// The SQLite file is stored in the same directory as this module.
const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening SQLite database:", err);
  } else {
    console.log("SQLite database connected at", dbPath);
  }
});

// Create tables if they do not exist.
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// Promise-based wrapper for db.get
function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Promise-based wrapper for db.run
function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Validate session token.
async function checkSession(token) {
  if (!token) throw new Error("Missing session token");
  const session = await dbGet("SELECT * FROM sessions WHERE token = ?", [token]);
  if (!session) throw new Error("Invalid session token");
  return session;
}

// Generate a random session token.
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = {
  db,
  dbGet,
  dbRun,
  checkSession,
  generateToken,
};
