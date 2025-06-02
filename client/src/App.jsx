import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { NotFoundLayout, LoginLayout, HeaderLayout, BodyLayout } from './components/Layout.jsx'

import { useState, useEffect } from 'react';
import { Container , Navbar , Form } from 'react-bootstrap';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
// TODO: import { GenericLayout, NotFoundLayout, AddLayout, EditLayout, LoginLayout } from './components/Layout';


function App() {

  return (
    <Routes>
      <Route path="/" element={<HeaderLayout />}>
        <Route index element={<BodyLayout/>} />

      </Route>
        

    </Routes>
  )
}



export default App
