
const SERVER_URL = 'http://localhost:3001/api/';


/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
        httpResponsePromise.then((response) => {
            if (response.ok) {
                // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
                response.json()
                    .then(json => resolve(json))
                    .catch(err => reject({ error: "Cannot parse server response" }));
            } else {
                // analyzing the cause of error
                response.json()
                    .then(obj =>
                        reject(obj)
                    ) // error msg in the response body
                    .catch(err => reject({ error: "Cannot parse server response" }));  // something else
            }
        })
        .catch(err => reject({ error: "Cannot communicate with the server" }));  // connection error
    });
}

/**
 * This function retrieves from the server side and returns the list of posts.
 */
const getPosts = async () => {
  return getJson(
    fetch(SERVER_URL + 'posts')
  ).then(json => {
    return json.map((post) => {
      const clientPost = {
        id: post.id,
        title: post.title,
        text: post.text,
        userName: post.userName,
        userId: post.userId,
        timestamp: post.timestamp,
        maxComments: post.maxComments,
        commentCount: post.commentCount
      }
      return clientPost;
    })
  });
}

/**
 * This function creates a new post by sending data to the server.
 */
const createPost = async (post) => {
  return getJson(
    fetch(SERVER_URL + 'posts', {
      method: 'POST',
      credentials: 'include',  // authentication cookie must be forwarded
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    })
  );
};

/**
 * This function deletes an existing post by its id.
 */
function deletePost(postId) {
  return getJson(
    fetch(SERVER_URL + "posts/" + postId, {
      method: 'DELETE',
      credentials: 'include'  // authentication cookie must be forwarded
    })
  );
}

/**
 * This function retrieves all comments for a specific post.
 */
const getCommentsForPost = async (postId) => {
  return getJson(
    fetch(SERVER_URL + 'posts/' + postId + '/comments', {
      method: 'GET',
      credentials: 'include'  // authentication cookie must be forwarded
    })
  ).then(json => {
    return json.map((comment) => {
      const clientComment = {
        id: comment.id,
        text: comment.text,
        userName: comment.userName,
        userId: comment.userId,
        timestamp: comment.timestamp,
        postId: postId,
        isInterestingForCurrentUser: comment.isInterestingForCurrentUser,
        countInterestingMarks: comment.countInterestingMarks
      };
      return clientComment;
    });
  });
};

/**
 * This function adds a new comment to a specific post.
 */
const addCommentToPost = async (postId, comment) => {
  return getJson(
    fetch(SERVER_URL + 'posts/' + postId + '/comments', {
      method: 'POST',
      credentials: 'include',   // authentication cookie must be forwarded
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    })
  );
};

/**
 * This function retrieves a single comment given its id.
 */
const getCommentById = async (commentId) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId, {
      method: 'GET',
      credentials: 'include'  // authentication cookie must be forwarded
    })
  ).then(comment => {
    // Return the comment including only the necessary information (this is just to pre-fill the input field when editing a comment)
    return {
      id: comment.id,
      text: comment.text,
    };
  });
};


/**
 * This function updates the text of an existing comment.
 */
const updateComment = async (commentId, newComment) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId, {
      method: 'PUT',
      credentials: 'include',  // authentication cookie must be forwarded
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newComment)
    })
  );
};

/**
 * This function deletes an existing comment given its id.
 */
const deleteComment = async (commentId) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId, {
      method: 'DELETE',
      credentials: 'include'  // authentication cookie must be forwarded
    })
  );
};

/**
 * This function marks or unmarks a comment as interesting.
 */
const markOrUnmarkCommentAsInteresting = async (commentId, interesting) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId + '/interesting', {
      method: 'PUT',
      credentials: 'include',  // authentication cookie must be forwarded
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interesting: interesting }),
    })
  );
};


/*** Authentication functions ***/

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwarded
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwarded
  })
  )
}


const API = { getPosts, createPost, deletePost, getCommentsForPost, addCommentToPost, getCommentById, updateComment, deleteComment, markOrUnmarkCommentAsInteresting, logIn, getUserInfo, logOut };
export default API;