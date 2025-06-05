import { Row, Col, Button, Form, Card, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';


function CommentForm(props) {

    const [text, setText] = useState(props.commentToEdit ? props.commentToEdit.text : '');

    const [errorMsg, setErrorMsg] = useState('');


    const handleSubmit = (event) => {
        event.preventDefault();   // VERY IMPORTANT: preventDefault() avoid the default form submission and reloading of the page

    }

    return (
        <>
            {errorMsg? <Alert variant='danger' onClose={()=>setErrorMsg('')} dismissible>{errorMsg}</Alert> : false }
            <Container className="my-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="shadow border-1 rounded-4 p-3">
                            <Card.Body>
                                <h3 className="mb-4 text-center">Add Comment</h3>
                                <Form onSubmit={handleSubmit}>

                                    {/* Text of the comment */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Comment</Form.Label><span className="text-danger ms-1">*</span>
                                        <Form.Control as="textarea" rows={4} placeholder="Write your comment here..." required 
                                            value={text} onChange={event => setText(event.target.value)} />
                                    </Form.Group>

                                    <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                                        <span className="text-danger">*</span> Mandatory fields.
                                    </p>

                                    <div className="d-flex justify-content-between">
                                        <Link to="/">
                                            <Button variant="secondary">Cancel</Button>
                                        </Link>
                                        {props.commentToEdit ?
                                              <Button variant="warning" className="add-comment-button" type="submit">Confirm edit</Button>
                                            : <Button className="submit-comment-button" type="submit">Submit</Button>}
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}


export { CommentForm };