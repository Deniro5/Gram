import React, { useState, Fragment } from "react";
import { withRouter } from "react-router-dom";

const MainPost = (props) => {
  const [showWriteComment, setShowWriteComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const {
    _id,
    author,
    date,
    likedBy,
    likes,
    comments,
    src,
    authorName,
    isLiked,
    index,
  } = props;

  const goToProfile = (id) => {
    props.history.push("/" + id);
  };

  const like = () => {
    props.like(_id, index);
  };

  const submitComment = () => {
    props.submitComment(comment, index, _id);
    setShowWriteComment(false);
    setShowComments(true);
    setComment("");
  };

  return (
    <div className='mainPost'>
      <img src={"" + src} />
      <div style={{ float: "right", margin: "20px", fontSize: "12px" }}>
        {likes} <img id='mainPostLikes' src='../img/like.png' />
      </div>
      <p id='mainPostAuthor'> Posted by: {authorName} </p>
      <p id='mainPostDate'> {date} </p>
      {!isLiked ? (
        <button className='mainPostLike' onClick={like}>
          Like
        </button>
      ) : (
        <button className='mainPostLike' style={{ background: "red" }}>
          Liked
        </button>
      )}
      <div className='divider' />
      {showWriteComment ? (
        <div style={{ textAlign: "center" }}>
          <button className='showButton' onClick={() => setShowWriteComment(false)}>
            Hide
          </button>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Type here... (Max 160 characters)'
          />
          <button id='mainPostCommentBtn' onClick={submitComment}>
            Submit Comment
          </button>
        </div>
      ) : (
        <button className='showButton' onClick={() => setShowWriteComment(true)}>
          Write a Comment
        </button>
      )}
      <div className='divider' />
      {showComments ? (
        <Fragment>
          <button className='showButton' onClick={() => setShowComments(false)}>
            Hide
          </button>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div className='modalImageComment'>
                <p
                  className='modalImageCommentUsername'
                  onClick={() => goToProfile(comment.id)}>
                  <b> {comment.author} </b>
                </p>
                <p> {comment.content}</p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center" }}>No comments to show</p>
          )}
        </Fragment>
      ) : (
        <button className='showButton' onClick={() => setShowComments(true)}>
          Show Comments
        </button>
      )}
    </div>
  );
};

export default withRouter(MainPost);
