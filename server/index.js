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
app.use(express.json()); // To automatically decode incoming json


/* Set up and enable Cross-Origin Resource Sharing (CORS) */
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,    // to get info related to the session (if it is set, CORS does not allow a generic origin *)
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');              // authentication middleware
const LocalStrategy = require('passport-local');   // authentication strategy (username and password)


/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser.
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if (!user)
    return callback(null, false, 'Incorrect username or password');

  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser)
}));

// Serializing in the session the user object given from LocalStrategy(verify)
passport.serializeUser(function (user, callback) {
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser(function (user, callback) {
  return callback(null, user); // this will be available in req.user
});


/** Creating the session */
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
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
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
      console.log(err);   // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(500).json({ error: 'Database error while retrieving posts' });
    }
  }
);

// 2. Create a new post, by providing all relevant information.
// POST /api/posts
// This route adds a new post to the forum.
app.post('/api/posts',    // TODO: include the middleware isLoggedIn
  [
    check('title').isLength({ min: 1 }),
    check('text').isLength({ min: 1 }).withMessage('Text cannot be empty'),
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
      authorId: 1   // TODO: DELETE 1 and WRITE 'req.user.id' WHEN AUTHN IS IMPLEMENTED, THIS WAS JUST FOR TESTING PURPOSES !!!
      // authenticated user => DO NOT USE the id coming from the client: the id MUST be retrieved from the session !!!
    };

    try {
      console.log("New post request:", req.body);   // TODO: delete this debug console log
      const createdPost = await postDao.createPost(post);   // TODO: pass 'req.user.id' as first parameter 
      res.json(createdPost);
    } catch (err) {
      if (err.code === 'DUPLICATE_TITLE') {
        res.status(409).json({ error: err.message });   // error: 409 Conflict (customly handled)
      } else {
        console.error(err);   // Logging errors is useful while developing, to catch SQL errors etc.
        res.status(503).json({ error: 'Database error during post creation.' });
      }
    }
  }
);

// 3. Delete an existing post, given its id.
// DELETE /api/posts/<id>
// Given a post id, this route deletes the associated post from the forum.
app.delete('/api/posts/:id',        // TODO: include the middleware isLoggedIn
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
        return res.status(404).json({ error: "Post not found." });
      }

      // Only the owner or an admin are allowed to delete the post

      /* TODO: uncomment this part once authentication has been implemented !!!
      if (post.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized to delete this post." });
      }
      */

      const numChanges = await postDao.deletePost(req.params.id);   // TODO: add 'req.user.id' as first parameter when calling deletePost()
      if (numChanges === 0) {
        res.status(404).json({ error: "Post not deleted." });
      } else {
        res.status(200).json(numChanges);  // deleted successfully
      }
    } catch (err) {
      console.error(err);   // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(503).json({ error: "Database error during post deletion." });
    }
});


/*** COMMENTS APIs ***/

// 4. Retrieve the list of all comments associated with a specific post, given its id.
// GET /api/posts/<id>/comments
// Given a post id, this route retrieves all associated comments.
app.get('/api/posts/:id/comments',
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
  ],
  async (req, res) => {
    try {
      const comments = await commentDao.getCommentsForPost(req.params.id);   // TODO: add 'req.user.id' as first parameter of getCommentsForPost()
      res.json(comments);
    } catch (err) {
      console.error(err);   // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(503).json({ error: 'Database error while retrieving comments.' });
    }
  }
);

// 5. Create a new comment related to a specific post, by providing all relevant information.
// POST /api/posts/<id>/comments
// This route adds a new comment to a specific post of the forum.
app.post('/api/posts/:id/comments', 
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
    check('text').isLength({ min: 1 }).withMessage('Text cannot be empty'),
  ],
  
  async (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter);  // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors); // error message is sent back as a json with the error info
    }

    const comment = {
      text: req.body.text,
      authorId: 1   // TODO: DELETE 1 and WRITE 'req.user.id' WHEN AUTHN IS IMPLEMENTED, THIS WAS JUST FOR TESTING PURPOSES !!!
      // authenticated user => DO NOT USE the id coming from the client: the id MUST be retrieved from the session !!!
    };

    try {
      const addedComment = await commentDao.addCommentToPost(comment, req.params.id);  // TODO: pass 'req.user.id' as first parameter 
      res.json(addedComment);
    } catch (err) {
      console.error(err);   // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(500).json({ error: 'Database error while adding comment.' });
    }
});

// 6. Retrieve an existing comment given its id.
// GET /api/comments/<id>
// Given a comment id, this route retrieves the corresponding comment.
app.get('/api/comments/:id',      // TODO: include the middleware isLoggedIn
  [
    check('id').isInt({min: 1}).toInt(),   // check: the id must represent a positive integer, then it is parsed to Int
  ],
  async (req, res) => {
    try {
      const comment = await commentDao.getCommentById(req.params.id);  // TODO: add 'req.user.id' as first parameter of getCommentById()
      if (comment.error) {
        res.status(404).json(comment);  // comment not found
      } else {
        res.json(comment);  // comment found
      }
    } catch (err) {
      console.error(err);  // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(503).json({ error: 'Database error while retrieving the single comment.' });
    }
  }
);


// 7. Update an existing comment, by providing the new text.
// PUT /api/comments/<id>
// This route allows to modify a comment, specifiying its id and the new text.
app.put('/api/comments/:id',      // TODO: include the middleware isLoggedIn
  [
    check('id').isInt({ min: 1 }).toInt(),    // check: the id must represent a positive integer, then it is parsed to Int
    check('text').isLength({ min: 1 }).withMessage('Text cannot be empty'),
  ],

  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);   // error message is sent back as a json with the error info
    }

    const commentId = Number(req.params.id);

    try {
      const oldComment = await commentDao.getCommentById(commentId);
      if (!oldComment || oldComment.error) {
        return res.status(404).json({ error: 'Comment not found.' });
      }

      /* TODO: uncomment this 'if statement' once authN is implemented !!!
      if (oldComment.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to edit this comment.' });
      }
      */

      const updatedComment = {
        text: req.body.text,
      };

      const result = await commentDao.updateComment(commentId, updatedComment);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);

    } catch (err) {
      console.error(err);   // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(503).json({ error: 'Database error while updating comment.' });
    }
  }
);

// 8. Delete an existing comment, given its id.
// DELETE /api/comments/<id>
// Given a comment id, this route deletes the associated comment from the forum.
app.delete('/api/comments/:id',       // TODO: include the middleware isLoggedIn
  [ 
    check('id').isInt({ min: 1 }).toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json(errors.errors);
    }

    const commentId = req.params.id;

    try {
      const comment = await commentDao.getCommentById(commentId);

      if (!comment || comment.error) {
        return res.status(404).json({ error: "Comment not found." });
      }

      // Only the owner or an admin are allowed to delete the comment

      /* TODO: uncomment this part once authentication has been implemented !!!
      if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized to delete this comment." });
      }
      */

      const numChanges = await commentDao.deleteComment(commentId);
      if (numChanges === 0) {
        res.status(404).json({ error: "Comment not deleted." });
      } else {
        res.status(200).json(numChanges);  // deleted successfully
      }
    } catch (err) {
      console.error(err);   // Logging errors is useful while developing, to catch SQL errors etc.
      res.status(503).json({ error: "Database error during comment deletion." });
    }
  }
);

// 9. Mark / unmark an existing comment as interesting / not interesting, given its id.
// PUT /api/comments/<id>/interesting
// Given a comment id, this route modifies the associated interesting flag.
app.put('/api/comments/:id/interesting',    // TODO: include the middleware isLoggedIn
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
    const userId = 1;   // TODO: DELETE 1 and WRITE 'req.user.id' WHEN AUTHN IS IMPLEMENTED, THIS WAS JUST FOR TESTING PURPOSES !!!
      // authenticated user => DO NOT USE the id coming from the client: the id MUST be retrieved from the session !!!

    try {
      const comment = await commentDao.getCommentById(commentId);   // Server-side check: commentId must exist.
      if (comment.error)
        return res.status(404).json({ error: 'Comment not found.' });

      const result = interesting ? await commentDao.markCommentAsInteresting(userId, commentId)
                                : await commentDao.unmarkCommentAsInteresting(userId, commentId);
      if (result.error)
        res.status(400).json(result);
      else
        res.json(result);
    } catch (err) {
      console.error(err);
      res.status(503).json({ error: 'Database error while updating interesting flag for a comment.' });
    }
  }
);



// Activating the server
const PORT = 3001;
app.listen(PORT, (err) => {
  if (err)
    console.log(err);
  else
    console.log(`Server listening at http://localhost:${PORT}/`);
});
