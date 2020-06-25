import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import Picmodal from "./Picmodal";
import UserList from "./UserList";

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPostImg, setModalPostImg] = useState("");
  const [modalPostDate, setModalPostDate] = useState("");
  const [modalPostComments, setModalPostComments] = useState([]);
  const [modalPostLikes, setModalPostLikes] = useState(0);
  const [modalPostId, setModalPostId] = useState(0);
  const [modalIndex, setModalIndex] = useState(-1);
  const [user, setUser] = useState({});
  const [userexists, setUserexists] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const { userId } = useParams();

  useEffect(
    () => {
      fetch("users/" + userId, {
        method: "get",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.error) {
          } else {
            setUser(json.user);
            setPosts(json.posts);
            setFollowers(json.followerInfo);
            setFollowing(json.followingInfo);
            setUserexists(true);
            setIsUser(json.isUserProfile);
            setIsFollowing(json.isFollowing);
          }
          setIsLoaded(true);
        });
    },
    [userId]
  );

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

  const handleClose = () => {
    setModalOpen(false);
  };

  const closeUserList = () => {
    setShowFollowing(false);
    setShowFollowers(false);
  };

  const like = (picid, index, e) => {
    fetch("posts/like/" + picid, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .catch((error) => alert(error))
      .then((response) => {
        let newPosts = [...posts];
        newPosts[index].isLiked = true;
        newPosts[index].likes += 1;
        setPosts(newPosts);
      });
    e.stopPropagation();
  };

  const submitComment = (content, index, picid) => {
    fetch("posts/comment/" + picid, {
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

  const follow = () => {
    fetch("users/follow", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user._id,
      }),
    })
      .then((response) => response.json())
      .catch((error) => alert(error))
      .then((response) => {
        setFollowers([response.newFollower, ...followers]);
        setIsFollowing(true);
      });
  };

  const unfollow = () => {
    fetch("users/unfollow", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user._id,
      }),
    })
      .then((response) => response.json())
      .catch((error) => alert(error))
      .then((response) => {
        if (!response.error) {
          let newFollowers = [...followers];
          newFollowers = newFollowers.filter((followers) => {
            return followers._id.toString() != response._id.toString();
          });
          setFollowers(newFollowers);
          setIsFollowing(false);
        }
      });
  };

  if (!isLoaded) {
    return (
      <div className='errorContainer'>
        <img src='../img/loading.gif' className='loadingWheel' alt='loading' />
      </div>
    );
  } else if (!userexists) {
    return (
      <div className='errorContainer'>
        <h1>Something Went Wrong...</h1>
        <p> (Page not found) </p>
      </div>
    );
  }
  let displayPosts =
    posts.length === 0 ? (
      <Grid item xs={12}>
        <h2 style={{ textAlign: "center", fontSize: "16px" }}> No posts to show </h2>
      </Grid>
    ) : (
      posts.map((post, index) => (
        <Grid item xs={12} sm={6} md={4}>
          <div className='homeImageContainer'>
            <div
              onClick={() =>
                handleOpen(
                  "" + post.src,
                  post.date,
                  post.likes,
                  post.comments,
                  post._id,
                  index
                )
              }
              className='homeImageOverlay'>
              {post.isLiked ? (
                <button style={{ background: "red" }} className='homeImageOverlayLike'>
                  Liked
                </button>
              ) : (
                <button
                  className='homeImageOverlayLike'
                  onClick={(e) => like(post._id, index, e)}>
                  Like
                </button>
              )}
            </div>
            <img alt='img' src={"" + post.src} />
          </div>
        </Grid>
      ))
    );

  return (
    <div className='homeContainer'>
      <div className='profileContainer'>
        <div className='profileImgContainer'>
          <img alt='profpic' src={"" + user.userImage} />
          {!isUser &&
            (!isFollowing ? (
              <button onClick={follow}> Follow </button>
            ) : (
              <button onClick={unfollow}> Unfollow </button>
            ))}
        </div>
        <div className='profileInfoContainer'>
          <h2> {user.username} </h2>
          <p id='profileFollowerCount' onClick={() => setShowFollowers(true)}>
            {followers.length} Followers
          </p>
          <p id='profileFollowerCount' onClick={() => setShowFollowing(true)}>
            {following.length} Following
          </p>
          <p id='profileBio'> {user.bio} </p>
        </div>
      </div>
      <div className='homeGridContainer'>
        <Grid container spacing={3}>
          {displayPosts}
        </Grid>
      </div>
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={modalOpen}
        onClose={handleClose}>
        <Picmodal
          user={user.username}
          close={handleClose}
          imgsrc={modalPostImg}
          date={modalPostDate}
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

export default Profile;
