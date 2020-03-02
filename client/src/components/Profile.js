import React, { Component} from 'react';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Picmodal from './Picmodal'


class Profile extends Component {

  state = {
    modalOpen:false,
    user: {},
    posts: [],
    following: [],
    userimage: "http://localhost:8000/uploads/defaultUser.png",
    modalPostImg: "",
    modalPostDate: "",
    modalPostLikes: 0,
    modalPostId: 0,
    curruserid: "",
    currusername: "",
    userexists:false,
    loggedIn:false,
    isLoaded: false,
  }

  componentWillMount() {
    fetch('http://localhost:8000/users/' + this.props.match.params.userId, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then((res) => res.json())
    .then((json) => {
            if (!json.message) {
              
            }
            else {
            this.setState({
                user: json.message[0],
                posts: json.message[0].posts.reverse(),
                following: json.message[0].following,
                userimage: "http://localhost:8000/" + json.message[0].userImage,
                userexists:true,
            })
            }
            this.setState({
              isLoaded: true
            })
        }); 
        if (localStorage.getItem("token") != null) {
          fetch('http://localhost:8000/users/userfromtoken/' + localStorage.getItem("token"), {
            method: 'get',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          })
          .then((res) => res.json())
          .then((json) => {
                  if (!json.message) {
                   
                  }
                  else {
                  this.setState({
                    curruserid: json.message._id,
                    currusername: json.message.username,
                    loggedIn:true,
                    //userimage: "http://localhost:8000/" + json.message.userImage
                  })
                }
              }); 
            }
    }

    routerWillLeave(nextState) { // return false to block navigation, true to allow
      if (nextState.action === 'POP') {
        
      }
    }

    handleOpen = (newModalPostImg, newModalPostDate, newModalPostLikes, newModalPostComments, newModalPostId) => {  
      var temp = [];
      var count = newModalPostComments.length-1;
      while (count > -1) {
        temp.push(newModalPostComments[count])
        count--;
      }
      this.setState({
        modalOpen: true,
        modalPostImg: newModalPostImg,
        modalPostDate: newModalPostDate,
        modalPostLikes: newModalPostLikes,
        modalPostComments: temp,
        modalPostId: newModalPostId,
      })
    }


  handleClose = () => {
    this.setState({
      modalOpen: false
    })
  }


  like = (picid, e ) => {
    fetch('http://localhost:8000/users/like', {
      method: 'PATCH',
      headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
        token: localStorage.getItem("token"),
        id: this.state.user._id,
        picid: picid,
      })
    })
    .then(response => response.json())
    .catch(error => alert(error))
    .then(response => {
      //console.log('Success:', response)
      this.setState({
        posts: response.oldposts.reverse(),

      })
      }
    ); 
    e.stopPropagation()
  }

  submitComment = (content, picid) => {
   // alert( "Content: " + content + " picid " + picid);
    fetch('http://localhost:8000/users/comment', {
      method: 'PATCH',
      headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
        token: localStorage.getItem("token"),
        id: this.state.user._id,
        username: this.state.currusername,
        picid: picid,
        content: content
      })
    })
    .then(response => response.json())
    .catch(error => alert(error))
    .then(response => {
      //console.log('Success:', response)
      this.setState({
        posts: response.oldposts.reverse(),
        modalPostComments: response.newModalPostComments.reverse(),
      })
      }
    ); 
  }

  follow = () => {
    // alert( "Content: " + content + " picid " + picid);
     fetch('http://localhost:8000/users/follow', {
       method: 'PATCH',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         token: localStorage.getItem("token"),
         id: this.state.user._id,
       })
     })
     .then(response => response.json())
     .catch(error => alert(error))
     .then(response => {
       //console.log('Success:', response)
       this.setState({
         following: response.newfollowing,
       })
       }
     ); 
   }

  render() {
    var posts = [];
    var count = 0;

    if (!this.state.isLoaded) {
      return(    
        <div className = "errorContainer">
            <img src = "../img/loading.gif" className = "loadingWheel" alt = "loading"/>
        </div>)
    }
    else if (!this.state.userexists) {
      return(    
        <div className = "errorContainer">
          <h1>Something Went Wrong...</h1> 
          <p> (Page not found) </p>
        </div>)
    }
    while (count < this.state.posts.length) {
      var likebutton =[];
      if (this.state.posts[count].likes.includes(this.state.curruserid)) {
        likebutton.push(<button style = {{background: "red"}} className = "homeImageOverlayLike" onClick = {this.like.bind(this, this.state.posts[count].id)}> Liked </button>)
      }
      else if (this.state.curruserid.length>0) {
        likebutton.push(<button className = "homeImageOverlayLike" onClick = {this.like.bind(this, this.state.posts[count].id)}> Like </button>)
      }
      posts.push(
        <Grid item xs={12} sm = {6}  md = {4}>
        <div className = "homeImageContainer">
          <div onClick = {this.handleOpen.bind(this,"http://localhost:8000/" + this.state.posts[count].path, this.state.posts[count].date, this.state.posts[count].likes.length, this.state.posts[count].comments, this.state.posts[count].id)} className = "homeImageOverlay">
            {likebutton}
          </div>
          <img alt = "img" src = { "http://localhost:8000/" + this.state.posts[count].path}/>
        </div>
        </Grid>)
      count++;
    }

    var followbutton = [];
    if (this.state.curruserid.length === 0) {

    }
    else if (this.state.following.includes(this.state.curruserid)) {
      followbutton.push(<button style = {{background:"grey"}}> Following </button>)
    }
    else if (this.state.curruserid !== this.state.user._id) {
      followbutton.push(<button onClick = {this.follow}> Follow </button>)
    }
 
    
    return (
        <div className = "homeContainer">
             <div className = "profileContainer"> 
              <div className = "profileImgContainer">
                <img alt = "profpic" src = {this.state.userimage}/>
                {followbutton}
              </div>
              <div className = "profileInfoContainer">
                <h2> {this.state.user.username} </h2>
                <p> <b> {this.state.following.length} Followers </b> </p>
                <p> {this.state.user.bio} </p>
              </div>
             </div>
             <div className = "homeGridContainer">
             <Grid container spacing={3}>
              {posts}    
            </Grid>
              </div>
              <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={this.state.modalOpen}
              onClose={this.handleClose}
            >
              <Picmodal close = {this.handleClose} imgsrc = {this.state.modalPostImg} date = {this.state.modalPostDate} user = {this.state.user.username} likes = {this.state.modalPostLikes} comments = {this.state.modalPostComments} picid = {this.state.modalPostId} submitComment = {this.submitComment} loggedIn = {this.state.loggedIn}/>
            </Modal>
        </div>
    );
  }
}

export default Profile;
