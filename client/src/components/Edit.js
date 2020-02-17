import React, { Component} from 'react';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Picmodal from './Picmodal';
import AddCircle from '@material-ui/icons/AddCircleOutline';

class Edit extends Component {

  state = {
    modalOpen:false,
    uploadModalOpen:false,
    posts: [],
    modalPostImg: "",
    modalPostDate: "",
    modalPostLikes: 0,
    modalPostId: 0,
    uploadImage: "../img/Unknown.png",
    following:""
  }

  componentWillMount() {
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
        this.props.history.push("/login")       
      }
      else {
        this.setState({
          username: json.message.username,
          currid: json.message._id,
          bio: json.message.bio,
          userimage: "http://localhost:8000/" + json.message.userImage,
          posts: json.message.posts,
          following: json.message.following.length,
          //userimage: "http://localhost:8000/" + json.message.userImage
        })
      }

        }); 
      }
      else {
        this.props.history.push("./login")
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
      modalOpen: false,
    })
  }

  handleUploadOpen = () => {
    this.setState({
      uploadModalOpen: true
    })
  }

  handleUploadClose = () => {
    this.setState({
      uploadModalOpen: false,
      uploadImage: "../img/Unknown.png"
    })
  }

  save = () => {
    fetch('http://localhost:8000/users/edit', {
			method: 'PATCH',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
        bio: this.refs.editbio.value,
        username: this.refs.editusername.value,
        token: localStorage.getItem("token")
      })
		})
		.then((res) => res.json())
		.then((json) => {
            // we need to stay on this page if theres an error
           if (json.error) {
             alert("hi")
           }
           alert("Changes saved successfully.")
           this.setState({
            username: this.refs.editusername.value,
            bio: this.refs.editbio.value,
           })
        });  
  }

  editImage = () => {           //This handles image upload
    if (this.refs.upload.files.length === 1) {
      var formData = new FormData();
      formData.append('token', localStorage.getItem("token"));
      formData.append('userImage', this.refs.upload.files[0]);
  
    fetch('http://localhost:8000/users/editimage', {
      method: 'PATCH',
      body: formData
    })
    .then(response => response.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
      console.log('Success:', response)
      this.setState({
        userimage: "http://localhost:8000/uploads/" + this.refs.upload.files[0].name
      })
      }
    );
  }
  else {
    alert("Please choose an image")
  }  
  }

  addImage = () => {           //This handles image upload
    var dateFormat = require('dateformat');
    var now = new Date();
    var date = dateFormat(now, "mmmm dS, yyyy");
    var id = this.uuid()
    if (this.refs.add.files.length === 1) {
      var formData = new FormData();
      formData.append('token', localStorage.getItem("token"));
      formData.append('date', date);
      formData.append('id', id);
      formData.append('userImage', this.refs.add.files[0]);
  
    fetch('http://localhost:8000/users/addimage', {
      method: 'PATCH',
      body: formData
    })
    .then(response => response.json())
    .catch(error => alert(error))
    .then(response => {
      //console.log('Success:', response)
      this.setState({
     //   userimage: "http://localhost:8000/uploads/" + this.refs.upload.files[0].name
        uploadModalOpen: false,
        uploadImage: "../img/Unknown.png",
        posts: [ ...this.state.posts, {path: "uploads/" + this.refs.add.files[0].name, date: date,  id:id, likes: [], comments: []}]
      })
      }
    );
  }
  else {
    alert("Please choose an image")
  }  
  }

  delete = (id, e) => {
    var choice = window.confirm("Are you sure you want to delete this post?")
    if (choice) {
    fetch('http://localhost:8000/users/dimage', {
      method: 'PATCH',
      headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
        token: localStorage.getItem("token"),
        id: id,
        posts: this.state.posts,
      })
    })
    .then(response => response.json())
    .catch(error => alert(error))
    .then(response => {
      //console.log('Success:', response)
    
      this.setState({
     //   userimage: "http://localhost:8000/uploads/" + this.refs.upload.files[0].name
        uploadModalOpen: false,
        posts: response.newposts,
      })
      }
    );
  }
  e.stopPropagation()
}

 uuid = () => {
  var y = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // eslint-disable-next-line
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }));
  return y
}

changeImage = () => {
  var reader = new FileReader();
  reader.onload = () => {
    this.setState({
      uploadImage: reader.result
    })
  };
  reader.readAsDataURL(this.refs.add.files[0])
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
       id: this.state.currid,
       username: this.state.username,
       picid: picid,
       content: content
     })
   })
   .then(response => response.json())
   .catch(error => alert(error))
   .then(response => {
     //console.log('Success:', response)
     this.setState({
       posts: response.oldposts,
       modalPostComments: response.newModalPostComments.reverse(),
     })
     }
   ); 
 }



  render() {

    var posts = [];
    var count = this.state.posts.length-1;
    while (count > -1) {
      posts.push(
        <Grid item xs={12} sm = {6}  md = {4}>
        <div className = "homeImageContainer">
        <div onClick = {this.handleOpen.bind(this,"http://localhost:8000/" + this.state.posts[count].path, this.state.posts[count].date, this.state.posts[count].likes.length, this.state.posts[count].comments, this.state.posts[count].id)} className = "homeImageOverlay">
          <button className = "homeImageOverlayDelete" onClick = {this.delete.bind(this,this.state.posts[count].id)}> Delete </button>
        </div>
          <img alt = "img" src = { "http://localhost:8000/" + this.state.posts[count].path}/>
        </div>
      </Grid>
      )
      count--;
      }

    return (
        <div className = "homeContainer">
             <div className = "profileContainer"> 
              <div className = "profileImgContainer">
                <div className = "editImage">
                <input onChange = {this.editImage} ref = "upload" type="file" name="pic" accept="image/*"/>
                  <img alt = "img"  src = {this.state.userimage}/>
                </div>
                <button onClick = {this.save} style = {{fontSize: "11px"}}> Save Changes </button>
              </div>
              <div className = "profileInfoContainer">
                <input ref = "editusername" className = "editUserName" defaultValue ={this.state.username} placeholder = "Username..." />
                <p> <b> {this.state.following} Followers </b> </p>
                <input ref = "editbio" className = "editBio" placeholder = "Bio..." defaultValue = {this.state.bio}/> 
              </div>
             </div>
             <div className = "homeGridContainer">
             <Grid container spacing={3}>

             <Grid item xs={12} sm = {6}  md = {4}>
                <AddCircle onClick = {this.handleUploadOpen} className = "uploadIcon"/>
              </Grid>
              {posts}
              </Grid>
              </div>
              <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={this.state.modalOpen}
              onClose={this.handleClose}
            >
                <Picmodal close = {this.handleClose} imgsrc = {this.state.modalPostImg} date = {this.state.modalPostDate} user = {this.state.username} likes = {this.state.modalPostLikes} comments = {this.state.modalPostComments} picid = {this.state.modalPostId} submitComment = {this.submitComment}/>
            </Modal>

            <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={this.state.uploadModalOpen}
              onClose={this.handleUploadClose}
            >
              <div className = "uploadImageContainer">
                <img alt = "img" src = {this.state.uploadImage}/>
                <div style = {{width:"60%", margin: "auto", marginTop:"30px"}}>
                <div className = "addImage">
                  <input onChange = {this.changeImage}  ref = "add" type="file" name="pic" accept="image/*"/>
                  <button> Find Image </button>
                </div>
                <div className = "addImage">
                <button onClick = {this.addImage}> Submit </button>  
                </div>
                </div>
                <p className = "uploadClose" onClick = {this.handleUploadClose}> x </p>
              </div>
            </Modal>
        </div>
    );
  }
}

export default Edit;
