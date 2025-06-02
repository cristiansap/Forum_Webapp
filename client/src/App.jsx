import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { useState, useEffect } from 'react';
import { Container , Navbar , Form } from 'react-bootstrap';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
// TODO: import { GenericLayout, NotFoundLayout, AddLayout, EditLayout, LoginLayout } from './components/Layout';


function App() {


  return (
    <>
      <Navbar variant="dark" className="navbar">
            <Navbar.Brand className="mx-2" href="index.html">
                <i className="bi bi-gem mx-2" style={{ fontSize: '1.3rem', color: 'gold' }}></i>
                Royal Forum
            </Navbar.Brand>
            <Form className="my-2 mx-auto inline" action="#" role="search" aria-label="Quick search">
                <Form.Control type="search" placeholder="Search" aria-label="Search query" />
            </Form>
        </Navbar>
    </>
  )
}

export default App
