'use strict';


/* Data Access Object (DAO) module for accessing forum posts data */

const db = require('./db');
const dayjs = require('dayjs');

// Convert a DB record into JSON object in API format (from snake_case to camelCase)
function convertPostFromDbRecord(record) {
  return {
    id: record.id,
    title: record.title,
    text: record.text,
    authorName: record.authorName,  // obtained through JOIN with USER table
    authorId: record.authorId,    // obtained through JOIN with USER table
    timestamp: dayjs(record.timestamp),
    maxComments: record.maxComments,
    commentCount: record.commentCount  // obtained through a subquery (this is not directly available info)
  };
}


/**
 * This function retrieves the list of all posts, with aggregated number of comments.
 */
exports.listPosts = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT p.id, p.title, p.text, p.timestamp, p.max_comments AS maxComments, u.name AS authorName, u.id AS authorId, COUNT(c.id) AS commentCount
            FROM POST p
                LEFT JOIN USER u ON p.user_ID = u.id
                LEFT JOIN COMMENT c ON c.post_ID = p.id
            GROUP BY p.id
            ORDER BY p.timestamp DESC`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const posts = rows.map((e) => convertPostFromDbRecord(e));
                resolve(posts);
            }
        });
    });
};

/**
 * This function retrieves a single post given its id.
 */
exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT p.id, p.title, p.text, p.timestamp, p.max_comments AS maxComments, u.name AS authorName, u.id AS authorId, COUNT(c.id) AS commentCount
            FROM POST p
                LEFT JOIN USER u ON p.user_ID = u.id
                LEFT JOIN COMMENT c ON c.post_ID = p.id
            WHERE p.id = ?`;

        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Post not found.' });
            } else {
                const post = convertPostFromDbRecord(row);
                resolve(post);
            }
        });
    });
};



/**
 * This function adds a new post in the database.
 * The post id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.createPost = (post) => {    // TODO: pass 'authorId' as first parameter inside the getPostById()
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO POST (title, text, max_comments, user_ID)
            VALUES (?, ?, ?, ?)`;

        const params = [post.title, post.text, post.maxComments, post.authorId];
        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed: POST.title")) {     // custom error message
                    reject({ code: 'DUPLICATE_TITLE', message: 'A post with this title already exists.' });
                } else {
                    reject(err);
                }
            } else {
            // return the object just inserted, with the automatically assigned id
            exports.getPostById(this.lastID)  // TODO: pass 'post.authorId' as first parameter inside the getPostById(), so I have also to modify accordingly the prototype of getPostById()
                .then(post => resolve(post))
                .catch(err => reject(err));
            }
        });
    });
};

/**
 * This function deletes an existing post given its id.
 */
exports.deletePost = (postId) => {   // TODO: pass 'authorId' as first parameter inside the deletePost()
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM POST WHERE id = ?';   // TODO: add 'AND user_ID = ?' at the end of the query
        db.run(sql, [postId], function (err) {      // TODO: add authorId as optional parameter like this: [postId, authorId]
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);  // return the number of deleted rows (0 if not authorized or not found)
            }
        });
    });
};
