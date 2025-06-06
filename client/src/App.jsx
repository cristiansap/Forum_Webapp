import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout, AddPostLayout, AddCommentLayout, EditCommentLayout } from './components/Layout.jsx'


function App() {

  const navigate = useNavigate();  // to be able to call useNavigate, the component must already be in <BrowserRouter> (done in main.jsx)

  const [postList, setPostList] = useState([]);     // post list initially empty
  const [dirty, setDirty] = useState(true);         // initially information has to be loaded
  const [message, setMessage] = useState({ type: '', text: '' });       // used to display confirmation / error messages


  const [user, setUser] = useState(undefined);  // logged user


  const showSuccess = (msg) => {
    setMessage({ type: 'success', text: msg });
    setTimeout(() => setMessage({ type: '', text: '' }), 1800);   // Hide the alert message after 1.8s
  };

  const showError = (msg) => {
    setMessage({ type: 'danger', text: msg });
  };

  // This function is for handling errors in a centralized manner
  const handleErrors = (err) => {
    let msg = '';

    if (err.error) {
      msg = err.error;
    } else if (Array.isArray(err) && err[0]?.msg) {
      msg = err[0].msg;
    } else if (err.errors && err.errors[0]?.msg) {
      msg = err.errors[0].msg;
    } else if (typeof err === 'string') {
      msg = err;
    } else {
      msg = 'An unexpected error occurred. Please try again.';
    }

    console.log('Full error object:', err);

    // Show a simple error to the user
    showError(msg);
  };


  useEffect(() => {
    if (dirty) {
      API.getPosts()
        .then(posts => {
          setPostList(posts);
          setDirty(false);
        })
        .catch((err) => handleErrors(err));
    }
  }, [dirty]);


  /** Functions to perform operations on data **/

  function createPost(post) {
    // Add information about the logged user (who is considered the author of the newly created post)
    post.authorId = user?.id;
    post.authorName = user?.name;

    return API.createPost(post)
      .then(() => {
        setDirty(true);  // trigger useEffect which reloads all posts
        showSuccess('Thanks! Your post is now online.');
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
      })
      .catch((err) => {
        handleErrors(err);
        throw err;    // propagate the error to the caller
      });
  }

  function deletePost(postId) {
    API.deletePost(postId)
      .then(() => {
        setDirty(true);
        showSuccess('The post has been removed.');
      })
      .catch(err => handleErrors(err));
  }

  function addCommentToPost(postId, comment) {
    API.addCommentToPost(postId, comment)
      .then(() => {
        setDirty(true);
        showSuccess('Thanks! Your comment is live.');
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
      })
      .catch((err) => handleErrors(err));
  }

  function editComment(commentId, newComment) {
    API.updateComment(commentId, newComment)
      .then(() => {
        setDirty(true);
        showSuccess('The comment has been updated.');
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
      })
      .catch((err) => handleErrors(err));
  }

  function deleteComment(commentId) {
      API.deleteComment(commentId)
        .then(() => {
          setDirty(true);
          showSuccess('The comment has been removed.');
        })
        .catch(err => handleErrors(err));
  }

  return (
    <Routes>
      <Route path="/" element={<GenericLayout />}>
        <Route index element={<BodyLayout posts={postList} setPostList={setPostList} dirty={dirty} setDirty={setDirty}
                                deletePost={deletePost} deleteComment={deleteComment} message={message} setMessage={setMessage} 
                                showError={showError} showSuccess={showSuccess} />} />
        <Route path="add-post" element={<AddPostLayout createPost={createPost} />} />
        <Route path="add-comment/:postId" element={<AddCommentLayout addCommentToPost={addCommentToPost} />} />
        <Route path="edit-comment/:id" element={<EditCommentLayout editComment={editComment} setMessage={setMessage} 
                                                  showError={showError} showSuccess={showSuccess} />} />
        <Route path="*" element={<NotFoundLayout />} />
      </Route>
        

    </Routes>
  )
}


export default App
