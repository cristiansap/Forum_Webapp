import { Button, Form, Card, Alert } from 'react-bootstrap';
import { useState } from 'react';


function PostForm(props) {

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

        if (maxComments !== undefined && !isNaN(parseInt(maxComments)))    // add 'maxComments' only if it is defined and it is a number
            newPost.maxComments = maxComments;

        // Perform data validation
        if (newPost.title.trim().length === 0) {
            setErrorMsg('Title of the post seems to be empty');
            return;
        }
        if (newPost.text.trim().length == 0) {
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
        <Card className="shadow border-1 rounded-4 p-3">
            <Card.Body>
                <h3 className="mb-4 text-center">Add New Post</h3>
                {errorMsg ? <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}
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
                        <Button variant="secondary" onClick={() => props.handleReturnHome()}>Cancel</Button>
                        <Button className="submit-post-button" type="submit">Submit</Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export { PostForm };