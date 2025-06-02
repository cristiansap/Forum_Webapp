import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import API from './API.js';

import { PostCard } from './components/PostCard';

import { useState, useEffect } from 'react';
import { Container , Navbar , Form } from 'react-bootstrap';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
// TODO: import { GenericLayout, NotFoundLayout, AddLayout, EditLayout, LoginLayout } from './components/Layout';


function App() {

  const samplePosts = [
  {
    id: 1,
    title: 'Welcome to Royal Forum!',
    author: 'king@royal.com',
    timestamp: '2025-06-01 14:15:00',
    text: 'This is our first official post!',
    maxComments: 10
  },
  {
    id: 2,
    title: 'Rules of the Forum',
    author: 'queen@royal.com',
    timestamp: '2025-06-01 16:30:00',
    text: 'Please be respectful and kind to others.',
    maxComments: 5
  }
];

const sampleComments = [
  {
    text: "Great post!",
    authorName: "Luigi",
    timestamp: "2025-06-01 10:40:01",
    interesting: true,
  },
  {
    text: "I disagree.",
    authorName: null,  // anonymous
    timestamp: "2025-06-01 10:45:12",
    interesting: false,
  },
  {
    text: "Very informative, thank you!",
    authorName: "Peach",
    timestamp: "2025-06-01 11:00:00",
    interesting: true,
  },
  {
    text: "Can you provide\nmore details?",
    authorName: "Toad",
    timestamp: "2025-06-01 11:05:25",
    interesting: false,
  }
];


function PostList () {
  return (
    <div>
      { samplePosts
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(post => (
          <PostCard key={post.id} post={post} comments={sampleComments} />
        ))
      }
    </div>
  );
};


  return (
    <>
      <Navbar variant="dark" className="main-color mb-4 ">
            <Navbar.Brand className="mx-2" href="index.html">
                <i className="bi bi-gem mx-2" style={{ fontSize: '1.3rem', color: 'gold' }}></i>
                Royal Forum
            </Navbar.Brand>
            <Form className="my-2 mx-auto inline" action="#" role="search" aria-label="Quick search">
                <Form.Control type="search" placeholder="Search" aria-label="Search query" />
            </Form>
        </Navbar>

      <PostList />
    </>
  )
}



export default App
