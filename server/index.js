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
  if(!user)
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
  secret: "ee94825a321dba2723d6d4fad1dbd96b17c1a348",     // SHA-1("This is the secret for the Forum Exam from the web application course")
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false },    // httpOnly: true (the cookie will be inaccessible to JavaScript code running in the browser)
}));                                            // secure: false (for the purposes of this course HTTPS is not used, but in a real-world scenario just set this option to "true")
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** APIs ***/


// 1. Retrieve the list of all the available posts.
// GET /api/posts
// This route returns all the posts authored by the current user.
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




// Activating the server
const PORT = 3001;
app.listen(PORT, (err) => {
  if (err)
    console.log(err);
  else 
    console.log(`Server listening at http://localhost:${PORT}/`);
});
