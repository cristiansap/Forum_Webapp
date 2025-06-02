BEGIN TRANSACTION;

PRAGMA foreign_keys = ON;   -- enable foreign keys in SQLite


CREATE TABLE IF NOT EXISTS USER (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    admin INTEGER NOT NULL CHECK (admin IN (0, 1)),
    hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    secret TEXT    -- optional (there must be only for admin users)
);

CREATE TABLE IF NOT EXISTS POST (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    user_ID INTEGER NOT NULL,
    text TEXT NOT NULL,
    max_comments INTEGER,  -- optional
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),    -- automatically set the current date/time when you enter
    FOREIGN KEY(user_ID) REFERENCES USER(id)
);

CREATE TABLE COMMENT (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),    -- automatically set the current date/time when you enter
    user_ID INTEGER,  -- optional (comments may be anonymous)
    post_ID INTEGER NOT NULL,
    FOREIGN KEY(user_ID) REFERENCES USER(id),
    FOREIGN KEY(post_ID) REFERENCES POST(id) ON DELETE CASCADE   -- when a post is deleted, all comments linked to that post are automatically deleted
);

CREATE TABLE INTERESTING (
    user_ID INTEGER NOT NULL,
    comment_ID INTEGER NOT NULL,
    PRIMARY KEY(user_ID, comment_ID),
    FOREIGN KEY(user_ID) REFERENCES USER(id),
    FOREIGN KEY(comment_ID) REFERENCES COMMENT(id) ON DELETE CASCADE   -- when a comment is deleted, all INTERESTING entries related to that comment are automatically deleted
);

-- The user ID is automatically inserted and incremented properly (thanks to autoincrement)
INSERT INTO USER (email, name, admin, hash, salt, secret)
VALUES
('u1@p.it','Cristian', 1, '6f8d5b84d60b6753c68ee195393c7b6b6939b23d579534daf9df73f74f16d74b','b99ab9a3a4861cfc','LXBSMDTMSP2I5XFXIYRGFVWSFI'),
('u2@p.it','Sofia', 1, '2893125de9d5723659c1f12f2e4467cf61d6e982c92a7f51d3c29e633f1f72d5','55421019646bef3f','LXBSMDTMSP2I5XFXIYRGFVWSFI'),
('u3@p.it','Anna', 0, '3757d2da3fd2f0a0148871b485d73c489c4a2d3267e30e3c160b985b28f32285','c188381ec1c96e9a',NULL),
('u4@p.it','Marika', 0, '99b25e123ae69d781c13ac6db05144585c8e34631a4b8b5dde47e81e56e7f87c','43f6278c2eb21fcf',NULL),
('u5@p.it','Fabio', 0, 'ee9502ac5a0b3d99caabb28b8a3a4b60d3d389ac17f7a79e5c0a84b2604f459d','21a948f946a7aec6',NULL);


COMMIT;