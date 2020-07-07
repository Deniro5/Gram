import React, { useState, useEffect } from "react";
import MainPost from "./MainPost";
import devMode from "./devmode";

const Main = () => {
  const [posts, setPosts] = useState([]);
  const [maxPosts, setMaxPosts] = useState(10);
  const [limit, setLimit] = useState(0);
  const [isLoaded, setIsLoaded] = useState(0);

  const fetchPreview = (oldPosts) => {
    fetch((devMode ? "http://localhost:5000/" : "/") + "posts/customfeed/" + maxPosts, {
      method: "get",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.posts) {
          const newPosts = [...oldPosts, ...json.posts];
          setPosts(newPosts);
          setIsLoaded(true);
          setLimit(json.count);
          if (limit !== 0) {
            window.addEventListener("scroll", handleScroll);
          }
        }
      })
      .catch((error) => alert(error));
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      maxPosts < limit // we need to get the max from the server
    ) {
      window.removeEventListener("scroll", handleScroll);
      setMaxPosts(maxPosts + 10);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(
    () => {
      fetchPreview(posts);
    },
    [maxPosts]
  );

  useEffect(
    () => {
      window.addEventListener("scroll", handleScroll);
    },
    [limit]
  );

  const like = (picid, index) => {
    fetch((devMode ? "http://localhost:5000/" : "/") + "posts/like/" + picid, {
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
      });
  };

  if (!isLoaded) {
    return (
      <div className='errorContainer'>
        <img src='../img/loading.gif' className='loadingWheel' alt='loading' />
      </div>
    );
  }

  return (
    <div id='mainContainer'>
      {posts.length === 0 ? (
        <h3 style={{ textAlign: "center" }}>
          Follow users to have their posts show on your home feed
        </h3>
      ) : (
        posts.map((post, index) => (
          <MainPost {...post} index={index} like={like} submitComment={submitComment} />
        ))
      )}
    </div>
  );
};

export default Main;
