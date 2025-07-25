// SQLite database initialization for AetherPress
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "../data");
const dbPath = path.join(dbDir, "aetherpress.db");

// Ensure /data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err.message);
  } else {
    console.log("Connected to SQLite database at", dbPath);
  }
});

module.exports = db;
