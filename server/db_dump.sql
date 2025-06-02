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


---- POSTS INSERTION ----

-- POSTS by Cristian (user_ID = 1)
INSERT INTO POST (title, user_ID, text, max_comments) VALUES
('Welcome to the Forum', 1, 'This is the first official post from the admin team.', 5),
('Security Tips', 1,
'Some basic tips to keep your accounts safe online.\n1. Use strong passwords.\n2. Enable two-factor authentication.\n3. Avoid clicking suspicious links.',
4);                       -- example of multiline text for a post


-- POSTS by Sofia (user_ID = 2)
INSERT INTO POST (title, user_ID, text, max_comments) VALUES
('New Features Coming Soon', 2, 'We are working on exciting new features. Stay tuned!', NULL),
('Bug Report Guidelines', 2, 'Please follow these steps to report bugs effectively.', 3);

-- POSTS by Anna (user_ID = 3)
INSERT INTO POST (title, user_ID, text, max_comments) VALUES
('My Experience with React', 3, 'I want to share my learning journey with React.', 2),
('Study Tips for Exams', 3, 'Organize your study sessions and take regular breaks!', NULL);

-- POSTS by Marika (user_ID = 4)
INSERT INTO POST (title, user_ID, text, max_comments) VALUES
('Photography Passion', 4, 'Sharing some of my favorite moments captured on camera.', 5),
('Travel Diary', 4, 'My travel notes from last summer in Italy.', NULL);



---- COMMENTS INSERTION ----

-- Comments on post ID 1 (Cristian, max 5)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Great start!\n\nI hope this forum grows quickly.', 2, 1),       -- example of multiline text for a comment
('Looking forward to more updates.', NULL, 1),
('Nice job.', 3, 1),
('Well done!', 4, 1),
('Very informative.', 5, 1); -- maximum reached

-- Comments on post ID 2 (Cristian, max 4) -> NOTE: 3 comments (1 less than the maximum)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Thanks for the tips!', NULL, 2),
('Very helpful.', 4, 2),
('Good reminder.', 3, 2); -- STOP: 1 less than the maximum

-- Comments on post ID 3 (Sofia, no max)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Can’t wait to see them!', 1, 3),
('Awesome!', 4, 3);

-- Comments on post ID 4 (Sofia, max 3)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Thanks for the guide.', 5, 4),
('Clear and helpful.', NULL, 4),
('I’ll follow this.', 3, 4); -- maximum reached

-- Comments on post ID 5 (Anna, max 2) -> NOTE: 1 comment (1 less than the maximum)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Great insights, thank you!', 2, 5);  -- STOP: 1 less than the maximum

-- Comments on post ID 6 (Anna, no max)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Good advice.', 1, 6),
('Thanks!', NULL, 6);

-- Comments on post ID 7 (Marika, max 5)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Love this!', 5, 7),
('Your shots are amazing.', NULL, 7),
('Keep sharing!', 3, 7);

-- Comments on post ID 8 (Marika, no max)
INSERT INTO COMMENT (text, user_ID, post_ID) VALUES
('Italy is beautiful!', 2, 8),
('Nice post!', 1, 8);



---- INTERESTING INSERTIONS ----

-- Cristian marks some comments as interesting
INSERT INTO INTERESTING (user_ID, comment_ID) VALUES
(1, 1), (1, 4), (1, 10);

-- Sofia marks some comments as interesting
INSERT INTO INTERESTING (user_ID, comment_ID) VALUES
(2, 2), (2, 8);

-- Anna marks some comments as interesting
INSERT INTO INTERESTING (user_ID, comment_ID) VALUES
(3, 5), (3, 12);

-- Fabio marks some comments as interesting
INSERT INTO INTERESTING (user_ID, comment_ID) VALUES
(5, 7);


COMMIT;