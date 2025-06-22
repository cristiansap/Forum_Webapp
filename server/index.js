'use strict';

/* Importing modules */
const express = require('express');
const morgan = require('morgan');  // logging middleware
const { check, validationResult } = require('express-validator');  // validation middleware
const cors = require('cors');


const postDao = require('./dao-posts');         // module for accessing the posts in the DB
const commentDao = require('./dao-comments');   // module for accessing the comments in the DB
const userDao = require('./dao-users');         // module for accessing the users in the DB


/* Init express and set-up the middlewares */
const app = express();
app.use(morgan('dev'));
app.use(express.json()); // to automatically decode incoming json


/* Set up and enable Cross-Origin Resource Sharing (CORS) */
const corsOptions = {
  origin: 'http://localhost:5173',  // allow requests from the React development server
  credentials: true,    // to get info related to the session (if it is set, CORS does not allow a generic origin *)
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');              // authentication middleware
const LocalStrategy = require('passport-local');   // authentication strategy (username and password)

const base32 = require('thirty-two');
const TotpStrategy = require('passport-totp').Strategy;   // totp


/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser.
 **/
passport.use(new LocalStrategy(
  async function verify(username, password, callback) {
    const user = await userDao.getUser(username, password)
    if (!user)
      return callback(null, false, 'Incorrect username or password.');

    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser)
  }
));

// Serializing in the session the user object given from LocalStrategy(verify)
passport.serializeUser(function (user, callback) {
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser(function (user, callback) {
  /* Even though users cannot currently be deleted, fetching the user from the database
   * ensures the session remains consistent and up-to-date in case of potential future changes
   * (e.g., account status updates, admin actions, etc.).
   */
  return userDao.getUserById(user.id)
          .then(user => callback(null, user))   // this will be available in req.user
          .catch(err => callback(err, null));
});


/** Creating the session **/
const session = require('express-session');

app.use(session({
  secret: "87d99e23e0e459e26a43f7ad02df5c5c5694c747",     // secret = SHA-1("I am the student Cristian Sapia and this is the secret for the Forum Exam from the web application course")
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,     // httpOnly: true (the cookie will be inaccessible to JavaScript code running in the browser)
    secure: false       // secure: false (for the purposes of this course HTTPS is not used, but in a real-world scenario just set this option to "true")
  },
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(new TotpStrategy(
  function (user, done) {
    return done(null, base32.decode(user.secret), 30);  // 30 = period of key validity
  })
);


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized.' });
}

/** Two-Factor Authentication (2FA) verification middleware.
 * This middleware is intended to protect API endpoints that are strictly reserved for administrators.
 * In this project, all admin-level operations are also accessible to regular users if they are the resource owners.
 * Therefore, instead of enforcing 2FA via this middleware, I perform proper authorization checks directly within the route handlers.
 */
function isTotp(req, res, next) {
  if (req.session.method === 'totp')
    return next();
  return res.status(401).json({ error: 'Missing TOTP authentication.' });
}

/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** APIs ***/


/** POSTS APIs **/

// 1. Retrieve the list of all the available posts.
// GET /api/posts
// This route returns all the posts of the forum.
app.get('/api/posts',
  async (req, res) => {
    try {
      const posts = await postDao.listPosts();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: 'Database error while retrieving posts.' });
    }
  }
);

// 2. Create a new post, by providing all relevant information.
// POST /api/posts
// This route adds a new post to the forum.
app.post('/api/posts', isLoggedIn, 
  [
    check('title').trim().notEmpty().withMessage('Title cannot be empty.'),
    check('text').notEmpty().withMessage('Text cannot be empty.'),    // cannot perform .trim() otherwise newlines are erased
    check('maxComments').optional({ checkFalsy: true }).isInt({ min: 0 }).toInt()   // check if present and not falsy (e.g. null, ""), and maxComments must represent an integer >= 0, then it is parsed to Int
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);  // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors); // error message is sent back as a json with the error info
    }

    const post = {
      title: req.body.title,
      text: req.body.text,
      maxComments: req.body.maxComments,
    };

    try {
      const createdPost = await postDao.createPost(req.user.id, post);
      res.json(createdPost);
    } catch (err) {
      if (err.code === 'DUPLICATE_TITLE') {
        res.status(409).json({ error: err.message });   // error: 409 Conflict (customly handled)
      } else {
        res.status(503).json({ error: 'Database error during post creation.' });
      }
    }
  }
);

// 3. Delete an existing post, given its id.
// DELETE /api/posts/<id>
// Given a post id, this route deletes the associated post from the forum.
app.delete('/api/posts/:id', isLoggedIn,
  [ 
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);
    }

    const postId = req.params.id;
    const isAdmin = (req.session.method === 'totp');

    try {
      const post = await postDao.getPostById(postId);

      if (!post || post.error) {
        return res.status(404).json({ error: "Post not found." });
      }

      // Server-side check:
      // only the owner or an admin can delete the post
      if (post.userId !== req.user.id && !isAdmin) {
        return res.status(403).json({ error: "Not authorized to delete this post." });
      }

      const numChanges = await postDao.deletePost(req.params.id);
      if (numChanges === 0) {
        res.status(404).json({ error: "Post not deleted." });
      } else {
        res.status(200).json(numChanges);  // deleted successfully
      }
    } catch (err) {
      res.status(503).json({ error: "Database error during post deletion." });
    }
});


// 4. Retrieve a single post, given its id.
// GET /api/posts/<id>
// Given a post id, this route retrieves the associated post.
app.get('/api/posts/:id',
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);
    }

    const postId = req.params.id;

    try {
      const post = await postDao.getPostById(postId);

      if (!post || post.error) {
        res.status(404).json({ error: "Post not found." });   // post not found
      } else {
        res.json(post);   // post found
      }
    } catch (err) {
      res.status(503).json({ error: 'Database error while retrieving the post.' });
    }
  }
);

/*** COMMENTS APIs ***/

// 5. Retrieve the list of all comments associated with a specific post, given its id.
// GET /api/posts/<id>/comments
// Given a post id, this route retrieves all associated comments.
app.get('/api/posts/:id/comments',
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);
    }

    try {
      const userId = req.user ? req.user.id : null;   // if the user is NOT authenticated, then userId = null
      const comments = await commentDao.getCommentsForPost(userId, req.params.id);
      res.json(comments);
    } catch (err) {
      res.status(503).json({ error: 'Database error while retrieving comments.' });
    }
  }
);

// 6. Create a new comment related to a specific post, by providing all relevant information.
// POST /api/posts/<id>/comments
// This route adds a new comment to a specific post of the forum.
app.post('/api/posts/:id/comments',
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
    check('text').notEmpty().withMessage('Text cannot be empty.'),  // cannot perform .trim() otherwise newlines are erased
  ],
  
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);  // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors); // error message is sent back as a json with the error info
    }

    const userId = req.user ? req.user.id : null;   // if the user is NOT authenticated, then userId = null

    const comment = {
      text: req.body.text,
      userId: userId
    };

    try {
      // Retrieve info about the post
      const post = await postDao.getPostById(req.params.id);

      if (post.error) {
        return res.status(404).json({ error: 'Post not found.' });
      }

      // Check that the limit has NOT been reached
      if (post.maxComments != null && post.commentCount >= post.maxComments) {
        return res.status(409).json({ error: 'Maximum comment limit reached for this post.' });   // 409 Conflict
      }

      const addedComment = await commentDao.addCommentToPost(comment, req.params.id);
      res.json(addedComment);
    } catch (err) {
      res.status(500).json({ error: 'Database error while adding comment.' });
    }
});

// 7. Retrieve an existing comment given its id.
// GET /api/comments/<id>
// Given a comment id, this route retrieves the corresponding comment.
app.get('/api/comments/:id',
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
  ],
  async (req, res) => {
    try {

      const errors = validationResult(req).formatWith(errorFormatter);
      if (!errors.isEmpty()) {
        return res.status(422).json(errors.errors);
      }

      const userId = req.user ? req.user.id : null;   // if the user is NOT authenticated, then userId = null

      const comment = await commentDao.getCommentById(userId, req.params.id);
      if (comment.error) {
        res.status(404).json(comment);  // comment not found
      } else {
        res.json(comment);  // comment found
      }
    } catch (err) {
      res.status(503).json({ error: 'Database error while retrieving the single comment.' });
    }
  }
);

// 8. Update an existing comment, by providing the new text.
// PUT /api/comments/<id>
// This route allows to modify a comment, specifiying its id and the new text.
app.put('/api/comments/:id', isLoggedIn,
  [
    check('id').isInt({ min: 1 }).toInt(),    // check: the id must represent a positive integer, then it is parsed to Int
    check('text').notEmpty().withMessage('Text cannot be empty.'),  // cannot perform .trim() otherwise newlines are erased
  ],

  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);   // error message is sent back as a json with the error info
    }

    const commentId = Number(req.params.id);
    const isAdmin = (req.session.method === 'totp');

    try {
      const oldComment = await commentDao.getCommentById(req.user.id, commentId);
      if (!oldComment || oldComment.error) {
        return res.status(404).json({ error: 'Comment not found.' });
      }

      // Server-side check:
      // Only the owner or an admin can edit the comment
      if (oldComment.userId !== req.user.id && !isAdmin) {
        return res.status(403).json({ error: 'You are not authorized to edit this comment.' });
      }

      const updatedComment = {
        text: req.body.text,
        userId: req.user.id
      };

      const result = await commentDao.updateComment(commentId, updatedComment);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);

    } catch (err) {
      res.status(503).json({ error: 'Database error while updating comment.' });
    }
  }
);

// 9. Delete an existing comment, given its id.
// DELETE /api/comments/<id>
// Given a comment id, this route deletes the associated comment from the forum.
app.delete('/api/comments/:id', isLoggedIn,
  [ 
    check('id').isInt({ min: 1 }).toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);
    }

    const commentId = req.params.id;
    const isAdmin = (req.session.method === 'totp');

    try {
      const comment = await commentDao.getCommentById(req.user.id, commentId);

      if (!comment || comment.error) {
        return res.status(404).json({ error: "Comment not found." });
      }

      // Server-side check:
      // Only the owner or an admin can delete the comment
      if (comment.userId !== req.user.id && !isAdmin) {
        return res.status(403).json({ error: "Not authorized to delete this comment." });
      }

      const numChanges = await commentDao.deleteComment(commentId);
      if (numChanges === 0) {
        res.status(404).json({ error: "Comment not deleted." });
      } else {
        res.status(200).json(numChanges);  // deleted successfully
      }
    } catch (err) {
      res.status(503).json({ error: "Database error during comment deletion." });
    }
  }
);

// 10. Mark / unmark an existing comment as interesting / not interesting, given its id.
// PUT /api/comments/<id>/interesting
// Given a comment id, this route modifies the associated interesting flag.
app.put('/api/comments/:id/interesting', isLoggedIn,
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
    check('interesting').isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty())
      return res.status(422).json(errors.errors);

    const commentId = req.params.id;
    const interesting = req.body.interesting;
    const userId = req.user.id;   // DO NOT USE the id coming from the client: the id MUST be retrieved from the session !!!

    try {
      const comment = await commentDao.getCommentById(req.user.id, commentId);   // Server-side check: commentId must exist.
      if (comment.error)
        return res.status(404).json({ error: 'Comment not found.' });

      const result = interesting ? await commentDao.markCommentAsInteresting(userId, commentId)
                                : await commentDao.unmarkCommentAsInteresting(userId, commentId);
      if (result.error)
        res.status(400).json(result);   // 400 Bad Request
      else
        res.json(result);
    } catch (err) {
      res.status(503).json({ error: 'Database error while updating interesting flag for a comment.' });
    }
  }
);


/*** Users APIs ***/

function clientUserInfo(req) {
  const user = req.user;
  return { id: user.id, username: user.username, name: user.name, canDoTotp: user.secret ? true : false, isTotp: req.session.method === 'totp' };
}

// POST /api/sessions
// This route is used for performing login.
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success -> perform the login and extablish a login session
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser() in LocalStrategy Verify function
      return res.json(clientUserInfo(req));
    });
  })(req, res, next);
});

// POST /api/login-totp 
// This route is used for performing 2FA (2 Factor Authentication).
app.post('/api/login-totp', isLoggedIn,
  passport.authenticate('totp'),   // passport expect the totp value to be in: body.code
  function (req, res) {
    req.session.method = 'totp';
    res.json({ otp: 'authorized' });
  }
);

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(clientUserInfo(req));
  }
  else
    res.status(401).json({ error: 'Not authenticated.' });
});

// DELETE /api/sessions/current
// This route is used for logging out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});



// Activating the server
const PORT = 3001;
app.listen(PORT, (err) => {
  if (err)
    console.log(err);
  else
    console.log(`Server listening at http://localhost:${PORT}/`);
});
