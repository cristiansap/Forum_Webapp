'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');
const crypto = require('crypto');

// This function returns user's information given its id.
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, email, name, secret FROM USER WHERE id=?';    // do NOT include hash, salt
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve({ error: 'User not found.' });
            else {
                // By default, the local strategy looks for "username": 
                // for simplicity, instead of using "email", we create an object with that property.
                const user = { id: row.id, username: row.email, name: row.name, secret: row.secret }
                resolve(user);
            }
        });
    });
};

// This function is used at log-in time to verify username and password.
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM USER WHERE email=?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false);
            }
            else {
                // do NOT include hash, salt in the session
                const user = { id: row.id, username: row.email, name: row.name, secret: row.secret };

                // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
                crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {   // it's 32 even if the hash stored in the db is 64 hex characters long (because 2 hex characters == 1 byte)
                    if (err)
                        reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    });
};