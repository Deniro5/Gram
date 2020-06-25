import React, { useState, Fragment } from "react";
import { withRouter } from "react-router-dom";

const Picmodal = (props) => {
  const [showWriteComment, setShowWriteComment] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const toggleWriteComment = (status) => {
    setShowWriteComment(status);
  };

  const handleClose = () => {
    props.close();
  };

  const submitComment = () => {
    props.submitComment(commentContent, props.index, props.picid);
    setShowWriteComment(false);
  };

  const goToProfile = (id) => {
    props.history.push("/" + id);
    props.close();
  };

  var modalImageContent = [];
  var commentButton = [];
  if (showWriteComment) {
    modalImageContent.push(
      <Fragment>
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className='writeComment'
          placeholder='Type here... (Max 160 characters)'
        />
        <div className='commentButtonContainer'>
          <button onClick={submitComment}> Submit </button>
        </div>
      </Fragment>
    );
    commentButton.push(<button onClick={() => toggleWriteComment(false)}>Cancel</button>);
  } else {
    commentButton.push(
      <button onClick={() => toggleWriteComment(true)}> Write Comment </button>
    );
    let comments;
    comments =
      props.comments.length === 0 ? (
        <p style={{ textAlign: "center" }}> No comments to show</p>
      ) : (
        props.comments.map((comment) => (
          <div className='modalImageComment'>
            <p
              onClick={() => goToProfile(comment.id)}
              className='modalImageCommentUsername'>
              <b> {comment.author} </b>
            </p>
            <p> {comment.content} </p>
          </div>
        ))
      );
    modalImageContent.push(<div className='commentScroll'>{comments}</div>);
  }

  return (
    <div className='homeImageModal'>
      <p onClick={handleClose} className='homeImageModalClose'>
        x
      </p>
      <img className='homeImageModalImg' alt='' src={props.imgsrc} />
      <div className='commentContainer'>
        <div className='modalImageInfo'>
          <p style={{ cursor: "pointer", fontSize: "18px" }}>
            <b> {props.user} </b>
          </p>
          <p> {props.date} </p>
          <p id='likes'>
            {props.likes} <img alt='likes' src='../img/like.png' />
          </p>
          <div className='commentButtonContainer'>{commentButton}</div>
        </div>
        <div style={{ height: "1px", width: "100%", background: "lightgrey" }} />
        {modalImageContent}
      </div>
    </div>
  );
};

export default withRouter(Picmodal);
