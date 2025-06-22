import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout, AddPostLayout, AddCommentLayout, EditCommentLayout } from './components/Layout.jsx'


function App() {

  const navigate = useNavigate();  // to be able to call useNavigate, the component must already be in <BrowserRouter> (done in main.jsx)

  const [postList, setPostList] = useState([]);   // post list initially empty
  const [dirty, setDirty] = useState(true);       // initially information has to be loaded
  const [message, setMessage] = useState({ type: '', text: '' });   // used to display confirmation / error messages


  const [user, setUser] = useState(null);      // logged-in user
  const [loggedInAsAdmin, setLoggedInAsAdmin] = useState(false);  // keep track whether the currently logged-in user is an admin


  // This useEffect is for checking authentication when loading the app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged-in
        const user = await API.getUserInfo();
        setUser(user);
        // check if the user is authenticated as admin and set the state
        if (user.isTotp)
          setLoggedInAsAdmin(true);
      } catch (err) {
        // NO need to do anything: user is simply not yet authenticated
      }
    };
    checkAuth();
  }, []);  // the useEffect callback is called only the first time the component is mounted


  // This useEffect is for fetching forum posts when the 'dirty' flag is true
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


  const showSuccess = (msg) => {
    setMessage({ type: 'success', text: msg });
    setTimeout(() => setMessage({ type: '', text: '' }), 1600);   // Hide the alert message after 1.6s
  };

  const showError = (msg) => {
    setMessage({ type: 'danger', text: msg });
  };

  const handleReturnHome = () => {
    navigate('/');    // navigate to the home
  }


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

    // Show the error to the user
    showError(msg);
  };
  

  // This function handles the login process.
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setMessage({ type: '', text: '' });
      setDirty(true);   // refresh list of posts after successful login
    } catch (err) {
      // error is handled and visualized in the login form, so do not manage error, but throw it
      throw err;
    }
  };

  // This function handles the logout process.
  const handleLogout = async () => {
    await API.logOut();

    // Clean up all React states related to authentication
    setUser(null);
    setLoggedInAsAdmin(false);
    
    // Refresh posts and navigate to the main route
    setDirty(true);
    navigate('/');
  };


  /** Functions to perform operations on data **/

  function createPost(post) {
    return API.createPost(post)
      .then(() => {
        setDirty(true);  // trigger useEffect which reloads all posts
        showSuccess('Thanks! Your post is now online.');
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
      })
      .catch((err) => {
        setDirty(true);
        navigate('/');    // navigate to the main page to see the error
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
        handleErrors(err);
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
      .catch((err) => {
        setDirty(true);
        navigate('/');    // navigate to the main page to see the error
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
        handleErrors(err);
      });
  }

  function editComment(commentId, newComment) {
    API.updateComment(commentId, newComment)
      .then(() => {
        setDirty(true);
        showSuccess('The comment has been updated.');
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
      })
      .catch((err) => {
        navigate('/');    // navigate to the main page to see the error
        window.scrollTo({ top: 0, behavior: 'smooth' });   // scroll the window smoothly to the top of the page
        handleErrors(err);
      });
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
      <Route path="/" element={<GenericLayout user={user} logout={handleLogout} handleReturnHome={handleReturnHome} loggedInAsAdmin={loggedInAsAdmin} />}>
        <Route index element={<BodyLayout user={user} loggedInAsAdmin={loggedInAsAdmin} posts={postList} setPostList={setPostList} dirty={dirty} setDirty={setDirty}
                                deletePost={deletePost} deleteComment={deleteComment} message={message} setMessage={setMessage} 
                                showError={showError} handleErrors={handleErrors} />} />
        <Route path="add-post" element={<AddPostLayout createPost={createPost} handleReturnHome={handleReturnHome} />} />
        <Route path="add-comment/:postId" element={<AddCommentLayout addCommentToPost={addCommentToPost} handleReturnHome={handleReturnHome} />} />
        <Route path="edit-comment/:id" element={<EditCommentLayout editComment={editComment} setMessage={setMessage} 
                                                  showError={showError} handleReturnHome={handleReturnHome} />} />
        <Route path="/login" element={<LoginLayout login={handleLogin} user={user} loggedInAsAdmin={loggedInAsAdmin} setLoggedInAsAdmin={setLoggedInAsAdmin}
                                        handleReturnHome={handleReturnHome} setDirty={setDirty} />} />
        <Route path="*" element={<NotFoundLayout />} />
      </Route>
    </Routes>
  )
}


export default App
