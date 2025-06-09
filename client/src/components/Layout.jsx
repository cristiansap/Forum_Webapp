import { Row, Col, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { CustomNavbar } from './CustomNavbar';
import { PostCard } from './PostCard'
import { CommentForm } from './CommentForm'
import { PostForm } from './PostForm'
import { LoginForm, TotpForm } from './Auth';

import API from '../API.js';


function NotFoundLayout() {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center text-center">
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </div>
    );
}

function LoginLayout(props) {

    if (props.user) {
        if (props.user.canDoTotp) {
            if (props.loggedInAsAdmin) {
                return <Navigate replace to='/' />; // admin redirected to home page
                                                    // Using 'replace' to avoid adding a new entry to the browser history,
                                                    // so that the user cannot navigate back to the previous page.
            } else {
                return <TotpLayout totpSuccessful={() => props.setLoggedInAsAdmin(true)} />;
            }
        } else {
            return <Navigate replace to='/' />; // authenticated user that cannot be admin is redirected to home page
                                                // Using 'replace' to avoid adding a new entry to the browser history,
                                                // so that the user cannot navigate back to the previous page.
        }
    } else {
        return (
            <LoginForm login={props.login} user={props.user} handleReturnHome={props.handleReturnHome} /> 
        );
    }
}

function TotpLayout(props) {
    return (
        <Row>
            <Col>
                <TotpForm totpSuccessful={props.totpSuccessful} />
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
        <div className="d-flex flex-column min-vh-100">
            <header>
                <Row>
                    <Col xs={12}>
                        <CustomNavbar user={props.user} logout={props.logout} handleReturnHome={props.handleReturnHome} loggedInAsAdmin={props.loggedInAsAdmin} />
                    </Col>
                </Row>
            </header>

            <main className="flex-grow-1">  {/* flex-grow-1 allows the component to expand and fill all the remaining vertical space. */}
                <Outlet />
            </main>

            <footer className="blockquote-footer text-center">
                &copy; Royal Forum · by Cristian Sapia<br />
            </footer>
        </div>
    );
}

function BodyLayout(props) {


    function PostList() {
        return (
            <div>
                {props.posts
                    .map(post => (
                        <PostCard key={post.id} user={props.user} loggedInAsAdmin={props.loggedInAsAdmin} post={post} deletePost={props.deletePost} deleteComment={props.deleteComment}
                            showError={props.showError} handleErrors={props.handleErrors} />
                    ))
                }
            </div>
        );
    };

    // If posts have not been loaded initially, show spinner and alert
    if (props.dirty) {
        return (
            <>
                { props.message.text &&
                    <div className="d-flex justify-content-center mt-2">
                        <Alert variant={props.message.type} className="text-center mx-auto" style={{ width: '42%' }}
                            onClose={() => props.setMessage({ type: '', text: '' })} dismissible >
                            {props.message.text}
                        </Alert>
                    </div>
                }

                <SpinnerLoadingLayout message="Loading posts..." />
            </>
        );
    }

    return (
        <>  
            <div className="top-bar d-flex justify-content-end me-4">
                {props.user ? (
                    <Link to={'/add-post'}>
                        <Button className="main-color add-post-button">
                            <i className="bi bi-plus-circle me-1" /> Add post
                        </Button>
                    </Link>
                ) : (
                    <Button className="main-color" disabled>
                        <i className="bi bi-lock-fill me-1" />
                        Login to add posts
                    </Button>
                )}
            </div>


            { props.message.text ?
                <div className="d-flex justify-content-center mt-2">
                    <Alert variant={props.message.type} className="text-center mx-auto" style={{ width: '42%' }}
                        onClose={() => props.setMessage({ type: '', text: '' })} dismissible >
                        {props.message.text}
                    </Alert>
                </div> : null
            }


            <PostList />
            
        </>
    );
}

function AddPostLayout(props) {
    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <PostForm createPost={props.createPost} handleReturnHome={props.handleReturnHome} />
                </Col>
            </Row>
        </Container>
    );
}

function AddCommentLayout(props) {

    const { postId } = useParams();

    return (
        <CommentForm addCommentToPost={props.addCommentToPost} postId={parseInt(postId)} handleReturnHome={props.handleReturnHome} />
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
                <CommentForm commentToEdit={commentToEdit} editComment={props.editComment} handleReturnHome={props.handleReturnHome} />
            ) : (
                <SpinnerLoadingLayout message={'Loading comment...'} />
            )}
        </>
    );
}

export { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout , AddPostLayout, AddCommentLayout, EditCommentLayout };