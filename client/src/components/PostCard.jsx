import { Card, Button, Collapse, ListGroup, Row, Col } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


function formatTextWithNewlines(text) {
  if (!text)
    return '';
  return text.replace(/\\n/g, '\n');    // convert literal strings '\n' to real newline characters
}

function CommentsCollapse(props) {

  return (
    <Collapse in={props.showComments}>
      <div className="mt-3">
        <h5 className="mb-3">Comments</h5>
        <ListGroup>
          {props.comments.map((comment, idx) => (
            <ListGroup.Item key={idx}>
              <div className="d-flex align-items-start">
                        
                {/* Golden star */}
                <Button variant="link" className="p-0 me-3 interesting-button tooltip-wrapper">
                  <i className={`bi ${comment.interesting ? 'bi-star-fill' : 'bi-star'}`} />
                  <span className="tooltip-text">Mark comment as interesting</span>
                </Button>

                {/* Comment text + author */}
                <div className="flex-grow-1">   {/* "flex-grow-1" ensure that the block occupies the central space */}
                  <p className="m-0 multiline-text">{formatTextWithNewlines(comment.text)}</p>
                  <small className="text-muted">
                    &mdash; {comment.authorName || 'anonymous'} [{(comment.timestamp).format('YYYY-MM-DD HH:mm:ss')}]
                  </small>
                </div>

                {/* Right-aligned buttons */}
                <div className="ms-2">
                  <Link to={`/edit-comment/${comment.id}`} >
                    <Button variant="outline-warning" size="sm" className="ms-2 edit-comment-btn"
                      onClick={() => console.log(`Comment with id ${comment.id} edited`)} >
                      <i className="bi bi-pencil-fill" />
                    </Button>
                  </Link>

                  <Button variant="outline-danger" size="sm" className="ms-2 delete-comment-btn"
                    onClick={() => console.log("Comment deleted")} >
                    <i className="bi bi-trash-fill" />
                  </Button>
                </div>

              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </Collapse>
  );

}

function PostCard(props) {

  const [showComments, setShowComments] = useState(false);

  const filteredComments = props.comments.filter(c => c.postId === props.post.id);

  return (
    <Card className="mb-4 mx-auto" style={{ maxWidth: '700px' }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0">
            {props.post.title}
          </Card.Title>
          <small className="text-muted">{(props.post.timestamp).format('YYYY-MM-DD HH:mm:ss')}</small>
        </div>
        <Card.Subtitle className="mb-2 text-muted">by {props.post.authorName}</Card.Subtitle>

        {/* Text of the post */}
        <Card.Text className="multiline-text">{formatTextWithNewlines(props.post.text)}</Card.Text>

        {/* Comment count info */}
        <div className="mb-2 text-muted">
          Maximum number of comments: {props.post.maxComments !== null ? props.post.maxComments : 'unlimited'}<br />
          Actual comments: {props.post.commentCount}
        </div>

        <div className="d-flex gap-2">
          <Button size="sm"
            onClick={() => setShowComments(!showComments)}
            className={showComments ? 'main-color hide-comments-button' : 'main-color show-comments-button'}>
            <i className={`bi ${showComments ? 'bi-caret-up-square-fill' : 'bi-caret-down-square-fill'} me-1`} />
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </Button>

          <Link to={'add-comment'} >
            <Button size="sm" className="add-comment-button">
              <i className="bi bi-chat-square-text-fill me-1"></i>
              Add Comment
            </Button>
          </Link>

          <Button variant="outline-danger" size="sm" className="ms-2 delete-post-btn ms-auto"
              onClick={() => console.log("POST DELETED")}>
            <i className="bi bi-trash-fill me-1" />
            Delete Post
          </Button>
        </div>

        <CommentsCollapse comments={filteredComments} showComments={showComments} />
            
      </Card.Body>
    </Card>
  );
}

export { PostCard };
