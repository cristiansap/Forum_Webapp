import { Row, Col, Button, Form, Card, Container, Spinner, Alert } from 'react-bootstrap';
import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
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


    function PostList() {
        return (
            <div>
                {props.posts
                    .map(post => (
                        <PostCard key={post.id} post={post} deletePost={props.deletePost}
                            deleteComment={props.deleteComment} showError={props.showError} showSuccess={props.showSuccess} />
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
                <Container className="d-flex">
                    <Row className="justify-content-center align-self-center w-100" style={{ marginBottom: '20vh', marginTop: '20vh' }}>
                        <Col xs="mt-10" className="text-center">
                            <Spinner animation="border" role="status" />
                            <div>Loading posts...</div>
                        </Col>
                    </Row>
                </Container>
            ) : (
                <PostList />
            )}
        </>
    );
}

function AddPostLayout(props) {

    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [maxComments, setMaxComments] = useState(undefined);

    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();   // VERY IMPORTANT: preventDefault() avoid the default form submission and reloading of the page

        const newPost = {
            "title": title,
            "text": text,
        };

        if (maxComments && !isNaN(parseInt(maxComments)))    // add 'maxComments' only if it is defined and it is a number
            newPost.maxComments = maxComments;

        // Perform data validation
        if (newPost.title.trim().length === 0) {
            setErrorMsg('Title of the post seems to be empty');
            return;
        }
        if (newPost.text.length == 0) {
            setErrorMsg('Text of the post seems to be empty');
            return;
        }
        else {
            // Proceed to update the data
            try {
                await props.createPost(newPost);    // it should return a Promise
            } catch (err) {
                const message = err?.error || 'Something went wrong while creating the post.';
                setErrorMsg(message);
            }
        }
    }

    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow border-1 rounded-4 p-3">
                        <Card.Body>
                            <h3 className="mb-4 text-center">Add New Post</h3>
                            { errorMsg ? <Alert variant='danger' onClose={()=>setErrorMsg('')} dismissible>{errorMsg}</Alert> : false }
                            <Form onSubmit={handleSubmit}>
                                {/* Title of the post */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label><span className="text-danger ms-1">*</span>
                                    <Form.Control type="text" value={title} onChange={event => setTitle(event.target.value)} placeholder="Enter the post title" required />
                                </Form.Group>

                                {/* Text of the post */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Text</Form.Label><span className="text-danger ms-1">*</span>
                                    <Form.Control as="textarea" value={text} onChange={event => setText(event.target.value)} rows={5} placeholder="Enter the post content" required />
                                </Form.Group>

                                {/* Max number of allowed comments */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Max Comments</Form.Label>   {/* OPTIONAL FIELD -> 'required' attribute not inserted */}
                                    <Form.Control type="number" value={maxComments ?? ''} onChange={event => setMaxComments(event.target.value === '' ? undefined : parseInt(event.target.value))}
                                        min={0} placeholder="Enter maximum number of allowed comments" />
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
                <Container className="d-flex">
                    <Row className="justify-content-center align-self-center w-100" style={{ marginBottom: '20vh', marginTop: '20vh' }}>
                        <Col xs="mt-10" className="text-center">
                            <Spinner animation="border" role="status" />
                            <div>Loading comment...</div>
                        </Col>
                    </Row>
                </Container>
            )}
        </>
    );
}

export { NotFoundLayout, LoginLayout, GenericLayout, BodyLayout , AddPostLayout, AddCommentLayout, EditCommentLayout };