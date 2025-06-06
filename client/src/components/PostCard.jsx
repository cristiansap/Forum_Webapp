import { Card, Button, Collapse, ListGroup } from 'react-bootstrap';
import { Outlet, Link, useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../API.js';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


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
          {props.comments?.length > 0 ? (
            props.comments.map((comment) => {
              // Convert the UTC timestamp to the client's local time zone using the browser settings, and format it to display it properly
              const dayjsTimestamp = dayjs.utc(comment.timestamp).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss');
              return (
                <ListGroup.Item key={comment.id}>
                  <div className="d-flex align-items-start">
                    <Button variant="link" className="p-0 me-3 interesting-button tooltip-wrapper">
                      <i className={`bi ${comment.isInterestingForCurrentUser ? 'bi-star-fill' : 'bi-star'}`} />
                      <span className="tooltip-text">Mark comment as interesting</span>
                    </Button>
                    <div className="flex-grow-1">
                      <p className="m-0 multiline-text">{formatTextWithNewlines(comment.text)}</p>
                      <small className="text-muted">
                        &mdash; {comment.authorName || 'anonymous'} [{dayjsTimestamp}]
                      </small>
                    </div>
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
              );
            })
          ) : (
            <ListGroup.Item>
              <div className="text-center text-muted py-2">
                No comments available for this post.        {/* TODO: implement this check: if(isLoggedIn): No comments available for this post.
                                                                                            else: No ANONYMOUS comments available for this post. */}
              </div>
            </ListGroup.Item>
          )}
        </ListGroup>
      </div>
    </Collapse>
  );
}

function PostCard(props) {
  const [showComments, setShowComments] = useState(false);
  const [commentsCache, setCommentsCache] = useState({});

  const handleToggleComments = async () => {

    if (!showComments) {
      try {
        // Fetching all comments for the post on which the user pressed the "Show Comments" button
        const fetchedComments = await API.getCommentsForPost(props.post.id);
        setCommentsCache(prev => ({ ...prev, [props.post.id]: fetchedComments }));
        setShowComments(true);      // and then show comments
        
      } catch (err) {
        console.error("An error occurred when fetching comments:", err);
      }
    } else {
      setShowComments(false);
    }
  };

  // Convert the UTC timestamp to the client's local time zone using the browser settings, and format it to display it properly
  const dayjsTimestamp = dayjs.utc(props.post.timestamp).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss');

  return (
    <Card className="mb-4 mx-auto" style={{ maxWidth: '700px' }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="mb-0">
            {props.post.title}
          </Card.Title>
          <small className="text-muted">{dayjsTimestamp}</small>
        </div>
        <Card.Subtitle className="mb-2 text-muted">by {props.post.authorName}</Card.Subtitle>

        <Card.Text className="multiline-text">{formatTextWithNewlines(props.post.text)}</Card.Text>

        <div className="mb-2 text-muted">
          Maximum number of comments: {props.post.maxComments !== null ? props.post.maxComments : 'unlimited'}<br />
          Actual comments: {props.post.commentCount}
        </div>

        <div className="d-flex gap-2">
          <Button size="sm"
            onClick={handleToggleComments}
            className={
              showComments ? 'main-color hide-comments-button' : 'main-color show-comments-button' }>
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
              onClick={() => props.deletePost(props.post.id)}>
            <i className="bi bi-trash-fill me-1" />
            Delete Post
          </Button>
        </div>

        <CommentsCollapse comments={commentsCache[props.post.id]} showComments={showComments} />
            
      </Card.Body>
    </Card>
  );
}


export { PostCard };
