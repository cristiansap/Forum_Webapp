import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout, AddPostLayout, AddCommentLayout, EditCommentLayout } from './components/Layout.jsx'


function App() {

  const navigate = useNavigate();  // to be able to call useNavigate, the component must already be in <BrowserRouter> (done in main.jsx)

  const [postList, setPostList] = useState([]);        // post list initially empty
  const [dirty, setDirty] = useState(true);   // initially information has to be loaded


  const [user, setUser] = useState(undefined);  // logged user


  useEffect(() => {
    if (dirty) {
      API.getPosts()
        .then(posts => {
          setPostList(posts);
          setDirty(false);
        })
        .catch(err => { console.log(err); });
    }
  }, [dirty]);



  function createPost(post) {
    // Add information about the logged user (who is considered the author of the newly created post)
    post.authorId = user?.id;
    post.authorName = user?.name;

    API.createPost(post)
      .then(() => {
        setDirty(true);  // trigger useEffect which reloads all posts
        navigate('/');
      })
      .catch((err) => console.log(err));
  }



  function deletePost(postId) {
    API.deletePost(postId)
      .then(() => setDirty(true))
      .catch(err => console.log(err));
  }


  return (
    <Routes>
      <Route path="/" element={<GenericLayout />}>
        <Route index element={<BodyLayout posts={postList} setPostList={setPostList} dirty={dirty} setDirty={setDirty} deletePost={deletePost} />} />
        <Route path="add-post" element={<AddPostLayout createPost={createPost} />} />
        <Route path="add-comment" element={<AddCommentLayout />} />
        <Route path="edit-comment/:id" element={<EditCommentLayout />} />
        <Route path="*" element={<NotFoundLayout />} />
      </Route>
        

    </Routes>
  )
}


export default App
