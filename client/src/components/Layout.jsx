import { Row, Col, Button, Form, Card, Container, Alert } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { CustomNavbar } from './CustomNavbar';
import { PostCard } from './PostCard'
import { CommentForm } from './CommentForm'
import API from '../API.js';
// TODO: import { LoginForm } from './Auth';

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

function LoginLayout(props) {
    return (
        <Row>
            <Col>
                <LoginForm login={props.login} />
            </Col>
        </Row>
    );
}

function GenericLayout(props) {
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

    useEffect(() => {
        if (props.dirty) {
            API.getPosts().then(posts => {
                props.setPostList(posts);
                return Promise.all(posts.map(p => API.getCommentsForPost(p.id)));
            }).then(commentArrays => {
                // Merge all comments into one array
                props.setCommentList(commentArrays.flat());
                props.setDirty(false);
            }).catch(err => {
                console.log(err);
            });
        }
    }, [props.dirty]);


    function PostList() {
        return (
            <div>
                {props.posts
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))      // TODO: remove the sorting because it is already handled by the server, and test if it works (check if it works also for comments)
                    .map(post => (
                        <PostCard key={post.id} post={post} comments={props.comments} />
                    ))
                }
            </div>
        );
    };


    return (
        <>
            <div className="top-bar d-flex justify-content-end me-4">
                <Link to={'/add-post'}>
                    <Button className="main-color add-post-button">
                        <i className="bi bi-plus-circle me-1" /> Add post
                    </Button>
                </Link>
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

function AddPostLayout() {
    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow border-1 rounded-4 p-3">
                        <Card.Body>
                            <h3 className="mb-4 text-center">Add New Post</h3>
                            <Form>
                                {/* Title of the post */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label><span className="text-danger ms-1">*</span>
                                    <Form.Control type="text" placeholder="Enter the post title" required />
                                </Form.Group>

                                {/* Text of the post */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Text</Form.Label><span className="text-danger ms-1">*</span>
                                    <Form.Control as="textarea" rows={5} placeholder="Enter the post content" required />
                                </Form.Group>

                                {/* Max number of allowed comments */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Max Comments</Form.Label>   {/* OPTIONAL FIELD -> 'required' not included */}
                                    <Form.Control type="number" min={0} placeholder="Enter maximum number of allowed comments" />
                                </Form.Group>

                                <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                                    <span className="text-danger">*</span> Mandatory fields.
                                </p>

                                <div className="d-flex justify-content-between">
                                    <Link to="/">
                                        <Button variant="secondary">Cancel</Button>
                                    </Link>
                                    <Button className="submit-post-button" type="submit">Submit</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

function AddCommentLayout() {
    return (
        <CommentForm />
    );
}

function EditCommentLayout(props) {

    const { id } = useParams();
    const commentToEdit = props.comments && props.comments.find(c => c.id === parseInt(id));

    return (
        <>
            { commentToEdit ? 
                <CommentForm commentToEdit={commentToEdit} />
                : <Navigate to={"/"} />
            }
        </>
    );
}

export { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout , AddPostLayout, AddCommentLayout, EditCommentLayout};