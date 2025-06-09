import { Card, Button, Collapse, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API from '../API.js';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


function formatTextWithNewlines(text) {
  if (!text)
    return '';

  // Convert literal '\n' to real newlines if needed
  let processedText = text.replace(/\\n/g, '\n');

  // If the string ends with one or more newlines, add a zero-width space ('\u200B')
  // NOTE: this is necessary to avoid the standard HTML rendering behavior (which avoids adding unnecessary “white space” at the end)
  if (/\n+$/.test(processedText)) {
    processedText += '\u200B';  // this trick avoids visual problems and does not introduce visible characters
                                // into the text, but forces the rendering of the last empty line.
  }

  return processedText;
}


function CommentsCollapse(props) {

  const navigate = useNavigate();  // to be able to call useNavigate, the component must already be in <BrowserRouter> (done in main.jsx)

  return (
    <Collapse in={props.showComments}>
      <div className="mt-3">
        <h5 className="mb-3">{props.user ? "Comments" : "Anonymous Comments"}</h5>
        <ListGroup>
          {props.comments?.length > 0 ? (
            props.comments.map((comment) => {
              // Convert the UTC timestamp to the client's local time zone using the browser settings, and format it to display it properly
              const dayjsTimestamp = dayjs.utc(comment.timestamp).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss');
              const notAuthorized = !props.user || (props.user.id !== comment.userId && !props.loggedInAsAdmin);
              return (
                <ListGroup.Item key={comment.id}>
                  <div className="d-flex align-items-start justify-content-between">

                    <div className="d-flex flex-column align-items-center me-3">
                      <div className="tooltip-wrapper">
                        <Button variant="link" className="p-0 interesting-button" disabled={!props.user}
                          onClick={() => props.markOrUnmarkCommentAsInteresting(comment.id, !comment.isInterestingForCurrentUser)}>
                          <i className={`bi ${comment.isInterestingForCurrentUser ? 'bi-star-fill' : 'bi-star'}`} />
                        </Button>
                        <span className="tooltip-text-star-button">
                          {props.user ? (comment.isInterestingForCurrentUser ?
                            "Comment marked as interesting" : "Mark comment as interesting"
                          ) : "You're not authenticated."}
                        </span>
                      </div>
                      {props.user ? <small className="text-muted">{comment.countInterestingMarks}</small> : null}
                    </div>

                    <div className="flex-grow-1 limited-width-text">
                      <p className="m-0 multiline-text">{formatTextWithNewlines(comment.text)}</p>
                      <small className="text-muted">
                        &mdash; {comment.userName || 'anonymous'} [{dayjsTimestamp}]
                      </small>
                    </div>

                    <div className="ms-2">

                      <div className="tooltip-wrapper">
                        <Button variant="outline-warning" size="sm" className="ms-2 edit-comment-button"
                          onClick={() => navigate(`/edit-comment/${comment.id}`)}
                          disabled={notAuthorized}>
                          <i className="bi bi-pencil-fill" />
                        </Button>
                        {notAuthorized ? (
                          <span className="tooltip-text-edit-comment-button">
                            {props.user ? "You're not authorized." : "You're not authenticated."}
                          </span>
                        ) : (
                          <></>
                        )}
                      </div>

                      <div className="tooltip-wrapper">
                        <Button variant="outline-danger" size="sm" className="ms-2 delete-comment-button"
                          onClick={() => props.deleteComment(comment.id)}
                          disabled={notAuthorized}>
                          <i className="bi bi-trash-fill" />
                        </Button>
                      {notAuthorized ? (
                        <span className="tooltip-text-delete-comment-button">
                          {props.user ? "You're not authorized." : "You're not authenticated."}
                        </span>
                      ) : (
                        <></>
                      )}
                      </div>

                    </div>
                  </div>
                </ListGroup.Item>
              );
            })
          ) : (
            <ListGroup.Item>
              <div className="text-center text-muted py-2">
                {props.user ? "No comments available for this post." : "No anonymous comments available for this post."}
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
        props.showError('Comments failed to load. Please try again.');   // show an alert message to the user
      }
    } else {
      setShowComments(false);
    }
  };

  const markOrUnmarkCommentAsInteresting = async (commentId, interesting) => {
    try {
      await API.markOrUnmarkCommentAsInteresting(commentId, interesting);

      // Optimistic update (of the interesting flag)
      setCommentsCache(prev => {
        if (props.post.id) {  // check it just to be sure
          const updatedComments = prev[props.post.id].map(c =>
            c.id === commentId ? {
              ...c,
              isInterestingForCurrentUser: interesting,
              countInterestingMarks: c.countInterestingMarks + (interesting ? 1 : -1)
            }
              : c
          );
          return { ...prev, [props.post.id]: updatedComments };
        } else {
          return prev;
        }
      });
      
      // Refetch comments for that post after waiting a small delay (100 ms)
      await new Promise(res => setTimeout(res, 100));
      const refreshed = await API.getCommentsForPost(props.post.id);
      setCommentsCache(prev => ({ ...prev, [props.post.id]: refreshed }));

    } catch (err) {
      props.handleErrors(err);
    }
  };

  // Convert the UTC timestamp to the client's local time zone using the browser settings, and format it to display it properly
  const dayjsTimestamp = dayjs.utc(props.post.timestamp).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss');

  return (
    <Card className="mb-4 mx-auto" style={{ maxWidth: '700px' }}>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <Card.Title className="mb-0 limited-width-text">
            {props.post.title}
          </Card.Title>
          <small className="text-muted">{dayjsTimestamp}</small>
        </div>
        <Card.Subtitle className="mb-2 text-muted">by {props.post.userName}</Card.Subtitle>

        <Card.Text className="multiline-text">{formatTextWithNewlines(props.post.text)}</Card.Text>

        <div className="mb-2 text-muted">
          Maximum number of comments: {props.post.maxComments !== null ? props.post.maxComments : 'unlimited'}<br />
          Total number of comments: {props.post.commentCount}
        </div>

        <div className="d-flex gap-2">
          <Button size="sm"
            onClick={handleToggleComments}
            className={
              showComments ? "main-color hide-comments-button" : "main-color show-comments-button" }>
            <i className={`bi ${showComments ? "bi-caret-up-square-fill" : "bi-caret-down-square-fill"} me-1`} />
            {showComments ? "Hide Comments" : (
              props.user ? "Show Comments" : "Show Anonymous Comments"
            )}
          </Button>

          {props.post.maxComments !== null && props.post.commentCount >= props.post.maxComments ? (
            <div className="tooltip-wrapper">
              <Button size="sm" className="add-comment-button" disabled >
                <i className="bi bi-chat-square-text-fill me-1" />
                Add Comment
              </Button>
              <span className="tooltip-text-add-comment-button">
                Ops! Maximum number of comments reached.
              </span>
            </div>
          ) : (
            <Link to={`add-comment/${props.post.id}`}>
              <Button size="sm" className="add-comment-button" >
                <i className="bi bi-chat-square-text-fill me-1" />
                Add Comment
              </Button>
            </Link>
          )}

          
          <div className="tooltip-wrapper ms-auto">
            <Button variant="outline-danger" size="sm" className="ms-2 delete-post-button ms-auto"
              onClick={() => props.deletePost(props.post.id)}
              disabled={!props.user || (props.user.id !== props.post.userId && !props.loggedInAsAdmin)}>
              <i className="bi bi-trash-fill me-1" />
              Delete Post
            </Button>
            {!props.user || (props.user.id !== props.post.userId && !props.loggedInAsAdmin) ? (
              <span className="tooltip-text-delete-post-button">
                {props.user ? "You're not authorized." : "You're not authenticated."}
              </span>
            ) : (
              <></>
            )}
          </div>

        </div>

        <CommentsCollapse user={props.user} loggedInAsAdmin={props.loggedInAsAdmin} comments={commentsCache[props.post.id]} showComments={showComments} deleteComment={props.deleteComment} 
                          markOrUnmarkCommentAsInteresting={markOrUnmarkCommentAsInteresting} />
            
      </Card.Body>
    </Card>
  );
}


export { PostCard };
