import { Card, Button, Collapse, ListGroup, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

function PostCard(props) {
  const [open, setOpen] = useState(false);
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

              <Button variant="outline-danger" size="sm" className="ms-2 delete-post-btn ms-auto"
                  onClick={() => console.log("POST DELETED!")}>
                <i className="bi bi-trash-fill me-1" />
                Delete Post
              </Button>
            </div>

            <Collapse in={open}>
              <div className="mt-3">
                <h5 className="mb-3">Comments</h5>
                <ListGroup>
                  {props.comments.map((comment, idx) => (
                    <ListGroup.Item key={idx}>
                      <div className="d-flex align-items-start">
                        
                        {/* Golden star */}
                        <Button variant="link" className="p-0 me-3 interesting-button tooltip-wrapper">
                          <i className={`bi ${comment.interesting ? 'bi-star-fill' : 'bi-star'}`}></i>
                          <span className="tooltip-text">Mark comment as interesting</span>
                        </Button>

                        {/* Comment text + author */}
                        <div className="flex-grow-1">   {/* "flex-grow-1" ensure that the block occupies the central space */}
                          <div>{comment.text}</div>
                          <small className="text-muted">
                            — {comment.authorName || 'anonymous'} [{comment.timestamp}]
                          </small>
                        </div>

                        {/* Right-aligned buttons */}
                        <div className="ms-2">
                          <Button variant="outline-warning" size="sm" className="ms-2 edit-comment-btn"
                            onClick={() => console.log("Comment edited")} >
                            <i className="bi bi-pencil-fill"></i>
                          </Button>

                          <Button variant="outline-danger" size="sm" className="ms-2 delete-comment-btn me-2"
                            onClick={() => console.log("Comment deleted")} >
                            <i className="bi bi-trash-fill"></i>
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Collapse>
          </>
        ) : (
          <Button className="main-color" size="sm" disabled>
            <i className="bi bi-lock-fill me-1" />
            Login to view comments
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export { PostCard };
