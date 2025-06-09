'use strict';

/* Data Access Object (DAO) module for accessing forum comments data */

const db = require('./db');

// Convert a DB record into an object in API format.
// Note that JSON object requires camelCase.
function convertCommentFromDbRecord(record) {
  return {
    id: record.id,
    text: record.text,
    userName: record.userName,
    userId: record.userId,
    timestamp: record.timestamp,
    postId: record.postId,
    isInterestingForCurrentUser: !!record.isInterestingForCurrentUser,  // cast to boolean (0 -> false ; 1 -> true)
    countInterestingMarks: record.countInterestingMarks,
  };
}

/**
 * This function retrieves the list of all comments given a specific post id.
 */
exports.getCommentsForPost = (userId, postId) => {
    return new Promise((resolve, reject) => {
        let sql;
        let params;

        if (userId) {
            // Authenticated user -> include also the info about whether interesting flag has been marked or not
            sql = `SELECT c.id, c.text, c.timestamp, u.id AS userId, u.name AS userName,
                    COUNT(i.user_ID) AS countInterestingMarks,
                    EXISTS (
                        SELECT 1
                        FROM INTERESTING i2
                        WHERE i2.comment_ID = c.id AND i2.user_ID = ?
                    ) AS isInterestingForCurrentUser
                    FROM COMMENT c
                    LEFT JOIN USER u ON c.user_ID = u.id
                    LEFT JOIN INTERESTING i ON i.comment_ID = c.id
                    WHERE c.post_ID = ?
                    GROUP BY c.id
                    ORDER BY c.timestamp DESC`;
            params = [userId, postId];
        } else {
            // Anonymous user -> retrieve only anonymous comments (user_ID IS NULL)
            sql = `SELECT c.id, c.text, c.timestamp
                    FROM COMMENT c
                    WHERE c.post_ID = ? AND c.user_ID IS NULL
                    ORDER BY c.timestamp DESC`;
            params = [postId];
        }
        
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const comments = rows.map((e) => convertCommentFromDbRecord(e));
                resolve(comments);
            }
        });
    });
};

/**
 * This function retrieves a single comment given its id.
 */
exports.getCommentById = (userId, id) => {
    return new Promise((resolve, reject) => {
        let sql;

        if (userId) {
            // Authenticated user
            sql = `SELECT c.id, c.text, c.timestamp, c.post_ID AS postId, u.name AS userName, u.id AS userId,
                    0 AS countInterestingMarks, FALSE AS isInterestingForCurrentUser
                    FROM COMMENT c
                    LEFT JOIN USER u ON c.user_ID = u.id
                    WHERE c.id = ?`;    // a comment just added has 0 interesting marks (this is why "0 AS countInterestingMarks")
                                        // and it is not marked as interesting by the author by default (this is why "FALSE AS isInterestingForCurrentUser")
        } else {
            // Anonymous user
            sql = `SELECT c.id, c.text, c.timestamp, c.post_ID AS postId
                    FROM COMMENT c
                    WHERE c.id = ? AND c.user_ID IS NULL`;
        }
        
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Comment not found.' });
            } else {
                const comment = convertCommentFromDbRecord(row);
                resolve(comment);
            }
        });
    });
};


/**
 * This function adds a new comment related to a post in the database.
 * The comment id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.addCommentToPost = (comment, postId) => {
    return new Promise((resolve, reject) => {

        const sql = `INSERT INTO COMMENT(text, user_ID, post_ID)
                    VALUES (?, ?, ?)`;
        
        const params = [comment.text, comment.userId, postId];

        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                // return the object just inserted, with the automatically assigned id and timestamp
                exports.getCommentById(comment.userId, this.lastID)    // comment.userId represents the (potentially) logged user
                    .then(comment => resolve(comment))
                    .catch(err => reject(err));
            }
        });
    });
};

/**
 * This function updates an existing comment given its id and the new properties.
 */
exports.updateComment = (commentId, comment) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE COMMENT SET text = ? WHERE id = ?`;
        const params = [comment.text, commentId];

        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else if (this.changes !== 1) {
                resolve({ error: 'Comment not found' });
            } else {
                exports.getCommentById(comment.userId, commentId)
                    .then(updatedComment => resolve(updatedComment))
                    .catch(err => reject(err));
            }
        });
    });
};

/**
 * This function deletes an existing comment given its id.
 */
exports.deleteComment = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM COMMENT WHERE id = ?';   // there is no need for checking 'user_ID = ?', because I've already checked the author in app.delete('/api/comments/:id') inside index.js
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);  // return the number of deleted rows (0 if not authorized or not found)
            }
        });
    });
};

/**
 * This function marks an existing comment (given its id) as "interesting" for a specific user.
 * In particular, this function adds a new entry in the INTERESTING table of the database.
 */
exports.markCommentAsInteresting = (userId, commentId) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT OR IGNORE INTO INTERESTING(user_ID, comment_ID)
                    VALUES (?, ?)`;     // "INSERT OR IGNORE" is specified to avoid inserting duplicates if the comment is already marked as interesting by the current user.
                                        // This should be impossible to happen, unless some bug or malformed request occurs, so to be safe it is included.
        db.run(sql, [userId, commentId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

/**
 * This function unmarks an existing comment (given its id) as "interesting" for a specific user.
 * In particular, this function deletes an existing entry from the INTERESTING table of the database.
 */
exports.unmarkCommentAsInteresting = (userId, commentId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM INTERESTING WHERE user_ID = ? AND comment_ID = ?`;
        db.run(sql, [userId, commentId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};
