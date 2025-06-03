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
    timestamp: dayjs(record.timestamp),
    maxComments: record.maxComments,
    commentCount: record.commentCount  // obtained through a subquery (this is not directly available info)
  };
}


/**
 * This function retrieves the list of all posts, with aggregated number of comments.
 * This is the view seen by unauthenticated and authenticated users (initially).
 */
exports.listPosts = () => {
  return new Promise((resolve, reject) => {

        const sql = `SELECT p.id, p.title, p.text, p.timestamp, u.name AS authorName, p.max_comments AS maxComments, COUNT(c.id) AS commentCount
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

