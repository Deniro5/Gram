import React, { useEffect, useState, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import Picmodal from "./Picmodal";
import AddCircle from "@material-ui/icons/AddCircleOutline";
import UserList from "./UserList";
import { withRouter } from "react-router-dom";
import devMode from "./devmode";

const Edit = (props) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [userImage, setUserImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [modalPostImg, setModalPostImg] = useState("");
  const [modalPostDate, setModalPostDate] = useState("");
  const [modalPostComments, setModalPostComments] = useState([]);
  const [modalPostLikes, setModalPostLikes] = useState(0);
  const [modalPostId, setModalPostId] = useState(0);
  const [modalIndex, setModalIndex] = useState(-1);
  const [uploadImage, setUploadImage] = useState("../img/Unknown.png");
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const upload = useRef(null);
  const add = useRef(null);

  useEffect(() => {
    fetch((devMode ? "http://localhost:5000/" : "/") + "users/userprofile", {
      method: "get",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          props.history.push("/login");
        }
        return res.json();
      })
      .then((json) => {
        const user = json.user;
        if (!user) {
          setError(true);
          setIsLoaded(true);
        } else {
          setUsername(user.username);
          setBio(user.bio);
          setPosts(json.posts);
          setFollowers(json.followerInfo);
          setFollowing(json.followingInfo);
          setUserImage((devMode ? "http://localhost:5000/" : "/") + user.userImage);
          setIsLoaded(true);
          window.scrollTo(0, 0);
        }
      });
  }, []);

  const handleOpen = (
    newModalPostImg,
    newModalPostDate,
    newModalPostLikes,
    newModalPostComments,
    newModalPostId,
    newModalIndex
  ) => {
    //Open the modal and set all the modal properties
    setModalOpen(true);
    setModalPostImg(newModalPostImg);
    setModalPostDate(newModalPostDate);
    setModalPostLikes(newModalPostLikes);
    setModalPostComments(newModalPostComments);
    setModalPostId(newModalPostId);
    setModalIndex(newModalIndex);
  };

  const logout = () => {
    const choice = window.confirm("Are you sure you want to log out?");
    if (choice) {
      fetch((devMode ? "http://localhost:5000/" : "/") + "users/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }).then((res) => {
        props.history.replace("/login");
        //window.location.reload();
      });
    }
  };
  const handleClose = () => {
    setModalOpen(false);
  };

  const handleUploadOpen = () => {
    setUploadModalOpen(true);
  };

  const handleUploadClose = () => {
    setUploadModalOpen(false);
    setUploadImage("../img/Unknown.png");
  };

  const closeUserList = () => {
    setShowFollowing(false);
    setShowFollowers(false);
  };

  const save = () => {
    fetch((devMode ? "http://localhost:5000/" : "/") + "users/edit", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bio: bio,
        username: username,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
        }
      });
  };

  const editImage = () => {
    if (false) {
      if (upload.current.files.length === 1) {
        var formData = new FormData();
        formData.append("userImage", upload.current.files[0]);
        fetch((devMode ? "http://localhost:5000/" : "/") + "users/editimage", {
          method: "PATCH",
          credentials: "include",
          body: formData,
        })
          .then((response) => response.json())
          .catch((error) => console.error("Error:", error))
          .then((response) => {
            console.log("Success:", response);
            setUserImage("uploads/" + upload.current.files[0].name);
          });
      } else {
        alert("Please choose an image");
      }
    } else {
      alert("Uploading images prohibited in demo version");
    }
  };

  const addImage = () => {
    //This handles image upload
    var dateFormat = require("dateformat");
    var now = new Date();
    var date = dateFormat(now, "mmmm dS, yyyy");
    if (false) {
      if (add.current.files.length === 1) {
        var formData = new FormData();
        formData.append("date", date);
        formData.append("userImage", add.current.files[0]);
        fetch((devMode ? "http://localhost:5000/" : "/") + "posts/create", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
          .then((response) => response.json())
          .catch((error) => alert(error))
          .then((response) => {
            setUploadModalOpen(false);
            setUploadImage("../img/Unknown.png");
            setPosts([
              {
                src: response.src,
                date: date,
                _id: response.id,
                likedBy: [],
                likes: 0,
                comments: [],
              },
              ...posts,
            ]);
          });
      } else {
        alert("Please choose an image");
      }
    } else {
      alert("Uploading images prohibited in demo version");
    }
  };

  const deletePost = (id, e) => {
    var choice = window.confirm("Are you sure you want to delete this post?");
    if (false) {
      if (choice) {
        fetch((devMode ? "http://localhost:5000/" : "/") + "posts/" + id, {
          method: "DELETE",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .catch((error) => alert(error))
          .then((response) => {
            setUploadModalOpen(false);
            setPosts(response.posts);
          });
      }
      e.stopPropagation();
    } else {
      e.stopPropagation();
      if (choice) {
        alert("Deleting images prohibited in demo version");
      }
    }
  };

  const changeImage = () => {
    var reader = new FileReader();
    reader.onload = () => {
      setUploadImage(reader.result);
    };
    reader.readAsDataURL(add.current.files[0]);
  };

  const submitComment = (content, index, picid) => {
    fetch((devMode ? "http://localhost:5000/" : "/") + "posts/comment/" + picid, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    })
      .then((response) => response.json())
      .catch((error) => alert(error))
      .then((response) => {
        let newPosts = [...posts];
        newPosts[index].comments = [response.newComment, ...newPosts[index].comments];
        setPosts(newPosts);
        setModalPostComments(newPosts[index].comments);
      });
  };

  if (!isLoaded) {
    return (
      <div className='errorContainer'>
        <img src='../img/loading.gif' className='loadingWheel' alt='loading' />
      </div>
    );
  } else if (error) {
    return (
      <div className='errorContainer'>
        <h1>Something Went Wrong...</h1>
        <p> (Page not found) </p>
      </div>
    );
  }
  const displayPosts = posts.map((post, index) => (
    <Grid item xs={12} sm={6} md={4}>
      <div className='homeImageContainer'>
        <div
          onClick={() => {
            handleOpen(
              "" + post.src,
              post.date,
              post.likes,
              post.comments,
              post._id,
              index
            );
          }}
          className='homeImageOverlay'>
          <button
            className='homeImageOverlayDelete'
            onClick={(e) => deletePost(post._id, e)}>
            Delete
          </button>
        </div>
        <img alt='img' src={(devMode ? "http://localhost:5000/" : "/") + post.src} />
      </div>
    </Grid>
  ));
  return (
    <div className='homeContainer'>
      <p style={{ fontSize: "12px", fontWeight: "bold" }}>
        Click on your profile picture, username or bio to make changes
      </p>
      <div className='profileContainer'>
        <div className='profileImgContainer'>
          <div className='editImage'>
            <input
              onChange={editImage}
              ref={upload}
              type='file'
              name='pic'
              accept='image/*'
            />
            <img alt='img' src={userImage} />
            <button onClick={logout} style={{ fontWeight: 400, background: "red" }}>
              Logout
            </button>
          </div>
        </div>
        <div className='profileInfoContainer'>
          <input
            onBlur={save}
            className='editUserName'
            value={username}
            placeholder='Username...'
            onChange={(e) => setUsername(e.target.value)}
          />
          <p id='profileFollowerCount' onClick={() => setShowFollowers(true)}>
            {followers.length} Followers
          </p>
          <p id='profileFollowerCount' onClick={() => setShowFollowing(true)}>
            {following.length} Following
          </p>
          <textarea
            onBlur={save}
            className='editBio'
            placeholder='Bio...'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>
      <div className='homeGridContainer'>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <AddCircle onClick={handleUploadOpen} className='uploadIcon' />
          </Grid>
          {displayPosts}
        </Grid>
      </div>
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={modalOpen}
        onClose={handleClose}>
        <Picmodal
          close={handleClose}
          imgsrc={modalPostImg}
          date={modalPostDate}
          user={username}
          likes={modalPostLikes}
          comments={modalPostComments}
          picid={modalPostId}
          index={modalIndex}
          submitComment={submitComment}
        />
      </Modal>

      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={uploadModalOpen}
        onClose={handleUploadClose}>
        <div className='uploadImageContainer'>
          <img alt='img' src={uploadImage} />
          <div style={{ width: "60%", margin: "auto", marginTop: "30px" }}>
            <div className='addImage'>
              <input
                onChange={changeImage}
                ref={add}
                type='file'
                name='pic'
                accept='image/*'
              />
              <button> Find Image </button>
            </div>
            <div className='addImage'>
              <button onClick={addImage}> Submit </button>
            </div>
          </div>
          <p className='uploadClose' onClick={handleUploadClose}>
            x
          </p>
        </div>
      </Modal>
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={showFollowers || showFollowing}
        onClose={closeUserList}>
        <div className='userListModal'>
          <img
            alt='placeholder'
            onClick={closeUserList}
            src='/img/close.png'
            id='userListModalClose'
          />
          {showFollowing ? (
            <UserList users={following} title={"Following"} closeModal={closeUserList} />
          ) : (
            <UserList users={followers} title={"Followers"} closeModal={closeUserList} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default withRouter(Edit);
