import { Row, Col, Button, Alert } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate } from 'react-router-dom';

import { CustomNavbar } from './CustomNavbar';
import { PostCard } from './PostCard'
// TODO: import { LoginForm } from './Auth';
import { useState, useEffect } from 'react';


function NotFoundLayout() {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
}

// TODO: work on it
function LoginLayout(props) {
    return (
        <Row>
            <Col>
                <LoginForm login={props.login} />
            </Col>
        </Row>
    );
}

function HeaderLayout(props) {
    return (
        <>
            <Row>
                <Col xs={12}>
                    <CustomNavbar />
                </Col>
            </Row>


            <Outlet />

            <footer className="blockquote-footer ms-2 my-2"> &copy; 2025 Web Applications </footer>
        </>
    );
}

function BodyLayout(props) {

    /* TODO: REMOVE THIS PART AS SOON AS INFORMATION ARE LOADED FROM THE SERVER */
    const samplePosts = [
        {
            id: 1,
            title: 'Welcome to Royal Forum!',
            author: 'king Mark',
            timestamp: '2025-06-01 14:15:00',
            text: 'This is our first official post! \nThis is the Royal Forum: where a lot of discussions are available and new people may help you to discover something curious!',
            commentCount: 4,   // NOTE: THIS INFORMATION WILL NOT BE AVAILABLE DIRECTLY, IT WILL BE RETRIEVED WITH A PROPER SQL QUERY
            maxComments: 10
        },
        {
            id: 2,
            title: 'Rules of the Forum',
            author: 'queen Lady',
            timestamp: '2025-06-01 16:30:00',
            text: 'Please be respectful and kind to others.',
            commentCount: 4,
            maxComments: null
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
            text: "Can you provide more details?",
            authorName: "Toad",
            timestamp: "2025-06-01 11:05:25",
            interesting: false,
        }
    ];


    function PostList() {
        return (
            <div>
                {samplePosts
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))      // TODO: remove the sorting because it is already handled by the server, and test if it works
                    .map(post => (
                        <PostCard key={post.id} post={post} comments={sampleComments} />
                    ))
                }
            </div>
        );
    };


    return (
        <>
            <div className="top-bar d-flex justify-content-end me-4">
                <Button className="main-color add-post-button">
                    <i className="bi bi-plus-circle me-1" /> Add post
                </Button>

                {/*
                  *  TODO: IMPLEMENT THE FACT THAT IF THE USER IS AUTHENTICATED, SHOW THE BUTTON ABOVE, OTHERWISE THE ONE BELOW
                  
                <Button className="main-color" size="sm" disabled>
                <i className="bi bi-lock-fill me-1" />
                    Login to add posts
                </Button>

                */
                }
            </div>

            <PostList />

        </>
    );
}


export { NotFoundLayout, LoginLayout, HeaderLayout, BodyLayout };