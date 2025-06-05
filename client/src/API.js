
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
        .catch(err => reject({ error: "Cannot communicate" }));  // connection error
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
        authorName: post.authorName,
        authorId: post.authorId,
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
      method: 'POST',                 // TODO: add the following line below 'method' -> credentials: 'include',  // the route is protected by authentication, so authentication cookie must be forwarded
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
      method: 'DELETE',    // TODO: add the following line below 'method' -> credentials: 'include'  // the route is protected by authentication, so authentication cookie must be forwarded
    })
  );
}

/**
 * This function retrieves all comments for a specific post.
 */
const getCommentsForPost = async (postId) => {
  return getJson(
    fetch(SERVER_URL + 'posts/' + postId + '/comments')
  ).then(json => {
    return json.map((comment) => {
      const clientComment = {
        id: comment.id,
        text: comment.text,
        authorName: comment.authorName,
        authorId: comment.authorId,
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    })
  );
};

/**
 * This function updates the text of an existing comment.
 */
const updateComment = async (commentId, newText) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId, {
      method: 'PUT',    // TODO: add the following line below 'method' -> credentials: 'include'  // the route is protected by authentication, so authentication cookie must be forwarded
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newText })
    })
  );
};

/**
 * This function deletes an existing comment given its id.
 */
const deleteComment = async (commentId) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId, {
      method: 'DELETE',     // TODO: add the following line below 'method' -> credentials: 'include'  // the route is protected by authentication, so authentication cookie must be forwarded
    })
  );
};

/**
 * This function marks or unmarks a comment as interesting.
 */
const markOrUnmarkCommentAsInteresting = async (commentId, interesting) => {
  return getJson(
    fetch(SERVER_URL + 'comments/' + commentId + '/interesting', {
      method: 'PUT',      // TODO: add the following line below 'method' -> credentials: 'include'  // the route is protected by authentication, so authentication cookie must be forwarded
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interesting: interesting }),
    })
  );
};


const API = { getPosts, createPost, deletePost, getCommentsForPost, addCommentToPost, updateComment, deleteComment, markOrUnmarkCommentAsInteresting};
export default API;