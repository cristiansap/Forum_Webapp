import { Card, Container, Button, Collapse, ListGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';

function PostCard(props) {
  const [open, setOpen] = useState(true);
  const [showComments, setShowComments] = useState(true);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Card className="mb-4 mx-auto" style={{ maxWidth: '700px' }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0">{props.post.title}</Card.Title>
          <small className="text-muted">{props.post.timestamp}</small>
        </div>
        <Card.Subtitle className="mb-2 text-muted">by {props.post.authorName || 'anonymous'}</Card.Subtitle>
        <Card.Text>{props.post.text}</Card.Text>

        {showComments ? (
          <>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                onClick={handleToggle}
                className={open ? 'main-color hide-comments-button' : 'main-color show-comments-button'}
              >
                <i className={`bi ${open ? 'bi-caret-up-square-fill' : 'bi-caret-down-square-fill'} me-1`}></i>
                {open ? 'Hide Comments' : 'Show Comments'}
              </Button>

              <Button size="sm" className="add-comment-button">
                <i className="bi bi-chat-square-text-fill me-1"></i>
                Add Comment
              </Button>
            </div>

            <Collapse in={open}>
              <div className="mt-3">
                <h6>Comments</h6>
                <ListGroup>
                  {props.comments.map((comment, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-start">
                      <div>
                        <div>{comment.text}</div>
                        <small className="text-muted">
                          — {comment.authorName || 'anonymous'} [{comment.timestamp}]
                        </small>
                      </div>
                      <Button variant="link" className="p-0 ms-2 interesting-button">
                        <i className={`bi ${comment.interesting ? 'bi-star-fill' : 'bi-star'}`}></i>
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Collapse>
          </>
        ) : (
          <Button size="sm" disabled>
            <i className="bi bi-lock-fill me-1"></i>
            Login to view comments
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export { PostCard };
