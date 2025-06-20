'use strict';

/** DB access module **/

const sqlite = require('sqlite3');

/* Open the database */
const db = new sqlite.Database('forum_db.db', (err) => {
  if (err)
    throw err;
  else {
    db.run("PRAGMA foreign_keys = ON");   // enable foreign keys for this connection
    console.log("Connected to database.");
  }
});

module.exports = db;