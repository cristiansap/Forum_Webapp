import { Row, Col, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { CustomNavbar } from './CustomNavbar';
import { PostCard } from './PostCard'
import { CommentForm } from './CommentForm'
import { PostForm } from './PostForm'
// TODO: import { LoginForm } from './Auth';

import API from '../API.js';


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

function SpinnerLoadingLayout(props) {
    return (
        <Container className="d-flex">
            <Row className="justify-content-center align-self-center w-100" style={{ marginBottom: '20vh', marginTop: '20vh' }}>
                <Col xs="mt-10" className="text-center">
                    <Spinner animation="border" role="status" />
                    <div>{props.message}</div>
                </Col>
            </Row>
        </Container>
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


    function PostList() {
        return (
            <div>
                {props.posts
                    .map(post => (
                        <PostCard key={post.id} post={post} deletePost={props.deletePost} deleteComment={props.deleteComment}
                            showError={props.showError} showSuccess={props.showSuccess} />
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

            { props.message.text ?
                <div className="d-flex justify-content-center mt-2">
                    <Alert variant={props.message.type} className="text-center w-50" onClose={() => props.setMessage({ type: '', text: '' })} dismissible >
                        {props.message.text}
                    </Alert>
                </div> : null
            }

            {props.dirty ? (
                <SpinnerLoadingLayout message={'Loading posts...'} />
            ) : (
                <PostList />
            )}
        </>
    );
}

function AddPostLayout(props) {
    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <PostForm createPost={props.createPost} />
                </Col>
            </Row>
        </Container>
    );
}

function AddCommentLayout(props) {

    const { postId } = useParams();

    return (
        <CommentForm addCommentToPost={props.addCommentToPost} postId={parseInt(postId)} />
    );
}

function EditCommentLayout(props) {

    const navigate = useNavigate();  // to be able to call useNavigate, the component must already be in <BrowserRouter> (done in main.jsx)

    // Retrieve the id of the comment to edit from the URL
    const { id } = useParams();

    const [commentToEdit, setCommentToEdit] = useState(null);

    useEffect(() => {
        API.getCommentById(id)
            .then(comment => {
                if (comment.error) {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });   // scrolls the window smoothly to the top of the page
                } else {
                    setCommentToEdit(comment);
                }
            })
            .catch(err => {
                console.error('Error fetching the comment:', err);
                props.showError('Could not retrieve the comment. Please try again.');   // show an alert message to the user
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });   // scrolls the window smoothly to the top of the page
            });
    }, [id]);

    return (
        <>
            {commentToEdit ? (
                <CommentForm commentToEdit={commentToEdit} editComment={props.editComment} />
            ) : (
                <SpinnerLoadingLayout message={'Loading comment...'} />
            )}
        </>
    );
}

export { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout , AddPostLayout, AddCommentLayout, EditCommentLayout };