import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';

class Picmodal extends Component {

  state = {
    showWriteComment: false
  }

  toggleWriteComment = (status) => {
    this.setState({
      showWriteComment: status
    })
  }

  handleClose = () => {
    this.props.close()
  }

  submitComment = () => {
    this.props.submitComment(this.refs.commentcontent.value, this.props.picid)
    this.setState({
      showWriteComment: false
    })
  }

  goToProfile = (id) => {
    this.props.history.push("/" + id);
    document.location.reload();
  }

  render() {

    var modalImageContent = [];
    var commentButton = [];
    if (this.state.showWriteComment) {
      modalImageContent.push(
        <Fragment>
        <textarea ref = "commentcontent" className = "writeComment" placeholder = "Type here... (Max 160 characters)"/>
        <div className = "commentButtonContainer">
        <button onClick = {this.submitComment}> Submit </button>
        </div>
        </Fragment>
      )
      commentButton.push(<button onClick = {this.toggleWriteComment.bind(this,false)}> Cancel </button>)
    }
    else if (localStorage.getItem("token") == null || !this.props.loggedIn) {
      var comments = []
      var count = 0;
      while (count < this.props.comments.length) {
        comments.push(
          <div className = "modalImageComment">
            <p onClick = {this.goToProfile.bind(this, this.props.comments[count].id)} className = "modalImageCommentUsername"> <b> {this.props.comments[count].username} </b> </p>
            <p> {this.props.comments[count].content} </p>
          </div>
        )
        count++;
      }
      modalImageContent.push( 
      <div className = "commentScroll">
        {comments}
      </div>)
    }
    else {
      commentButton.push(<button onClick = {this.toggleWriteComment.bind(this,true)}> Write Comment </button>)
      // eslint-disable-next-line
      var comments = []
         // eslint-disable-next-line
      var count = 0;
      while (count < this.props.comments.length) {
        comments.push(
          <div className = "modalImageComment">
            <p onClick = {this.goToProfile.bind(this, this.props.comments[count].id)} className = "modalImageCommentUsername"> <b> {this.props.comments[count].username} </b> </p>
            <p> {this.props.comments[count].content} </p>
          </div>
        )
        count++;
      }
      modalImageContent.push( 
      <div className = "commentScroll">
        {comments}
      </div>)
    }


    return (

              <div className = "homeImageModal">
                <p onClick = {this.handleClose} className = "homeImageModalClose" > x </p>
                <img alt = "" src = {this.props.imgsrc}/>
                <div className = "commentContainer">
                  <div className = "modalImageInfo">
                    <p style = {{cursor: "pointer",  fontSize: "18px"}}> <b> {this.props.user} </b> </p>
                    <p> {this.props.date} </p>
                    <p> {this.props.likes} <img src = "../img/like.png"/> </p>
                    <div className = "commentButtonContainer">
                    {commentButton}
                    </div>
                  </div>
                  <div style = {{ height:"1px" , width: "100%", background: "lightgrey"}}/>
                  {modalImageContent}
                </div>
              </div>
    );
  }
}

export default withRouter(Picmodal);
