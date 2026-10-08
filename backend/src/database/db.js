const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

// Ensure database directory exists
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database instance
const db = new sqlite3.Database(config.databasePath, (err) => {
  if (err) {
    console.error(`[Database] Failed to open SQLite database at ${config.databasePath}:`, err.message);
  } else {
    console.log(`[Database] Connected to SQLite database at ${config.databasePath}`);
  }
});

// Enable Foreign Keys and WAL Mode for concurrency and data integrity
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) console.error('[Database] Failed to enable foreign keys:', err.message);
  });
  db.run('PRAGMA journal_mode = WAL;', (err) => {
    if (err) console.error('[Database] Failed to set WAL mode:', err.message);
  });
});

/**
 * Execute an INSERT, UPDATE, or DELETE query and return { id: lastID, changes }
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Retrieve a single row from database
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

/**
 * Retrieve multiple rows from database
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows || []);
    });
  });
}

/**
 * Execute raw multi-line SQL commands
 */
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Safely close the database connection
 */
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all,
  exec,
  close
};
