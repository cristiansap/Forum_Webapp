import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout, AddPostLayout, AddCommentLayout, EditCommentLayout } from './components/Layout.jsx'


function App() {

  const [postList, setPostList] = useState([]);        // post list initially empty
  const [dirty, setDirty] = useState(true);   // initially information has to be loaded


  return (
    <Routes>
      <Route path="/" element={<GenericLayout />}>
        <Route index element={<BodyLayout posts={postList} setPostList={setPostList} dirty={dirty} setDirty={setDirty} />} />
        <Route path="add-post" element={<AddPostLayout />} />
        <Route path="add-comment" element={<AddCommentLayout />} />
        <Route path="edit-comment/:id" element={<EditCommentLayout />} />
        <Route path="*" element={<NotFoundLayout />} />
      </Route>
        

    </Routes>
  )
}


export default App
