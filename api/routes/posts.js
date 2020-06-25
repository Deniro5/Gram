const express = require("express");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Post = require("../models/post");
const jwt = require("jsonwebtoken");
const multer = require("multer"); //for accepting files ___________________________________________
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //these functions called when file is accepted. null always goes first there
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //whatever we put here is the file name
  },
});
const fileFilter = (req, file, cb) => {
  // accept jpg and png reject everything else
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    // only take files over 5mb
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//___________________________________________________________________________________________
router.post("/create", upload.single("userImage"), async (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt.verify(req.cookies.JWT, "secret", async function (err, currUser) {
    if (!currUser) {
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    try {
      const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        author: currUser.userId,
        date: req.body.date,
        likedBy: [],
        likes: 0,
        comments: [],
        src: req.file.path,
      });
      let result = await post.save();
      let user = await User.find({ _id: currUser.userId });
      let newPosts = user[0].posts;
      newPosts.push(result._id);
      let result1 = await User.update({ _id: user[0]._id }, { posts: newPosts });
      return res.status(201).json({
        message: "Post successfully created",
        id: result._id,
        src: req.file.path,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: err,
      });
    }
  });
});

router.delete("/:postId", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      try {
        let post = await Post.findOne({ _id: req.params.postId }).select(["src"]);
        fs.unlinkSync(post.src);
        let result = await Post.deleteOne({ _id: req.params.postId });
        console.log(result);
        let user = await User.find({ _id: currUser.userId });
        let newPosts = user[0].posts;
        newPosts = newPosts.filter((post) => {
          return post != req.params.postId;
        });
        let result1 = await User.update({ _id: user[0]._id }, { posts: newPosts });
        let posts = await Post.find({ _id: { $in: user[0].posts } });

        res.status(200).json({
          message: "post deleted",
          posts: posts,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/like/:postId", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        res.json({
          user: "",
        });
      }
      try {
        let user1 = await User.find({ _id: currUser.userId });
        if (user1.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        let post = await Post.find({ _id: req.params.postId });
        if (post.length < 1) {
          res.status(401).json({
            message: "article doesnt exist",
          });
        }
        let newLikes = post[0].likedBy;
        newLikes.push(user1[0]._id);
        let result = await Post.update(
          { _id: post[0]._id },
          { likedBy: newLikes, likes: newLikes.length }
        );
        res.status(200).json({
          message: "success",
          newLike: user1[0]._id,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/comment/:postId", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        res.json({
          message: "user doesnt exist",
        });
      }
      try {
        let user1 = await User.find({ _id: currUser.userId });
        if (user1.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        let post = await Post.find({ _id: req.params.postId });
        if (post.length < 1) {
          res.status(500).json({
            message: "post doesnt exist",
          });
        }
        let newComments = post[0].comments;
        let newComment = {
          id: user1[0]._id,
          author: user1[0].username,
          content: req.body.content,
        };
        newComments.unshift(newComment);
        let result = await Post.update({ _id: post[0]._id }, { comments: newComments });
        res.status(200).json({
          message: "success",
          newComment: newComment,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/customfeed/:maxArticles", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      try {
        let user1 = await User.find({ _id: currUser.userId });
        let posts;
        let authorNames;
        let count;
        let authorIds = await User.find({
          _id: { $in: user1[0].following },
        }).select("_id");
        authorIds = authorIds.map((author) => author._id); //we want to get the ids of all the users that are being followed
        authorNames = await User.find({
          _id: { $in: authorIds },
        }).select("username");
        let authorDict = {};
        authorNames.forEach((author) => {
          authorDict[author._id] = author.username;
        });
        console.log(authorDict);
        posts = await Post.find({
          author: { $in: authorIds },
        })
          .sort({ _id: -1 })
          .skip(req.params.maxArticles - 10)
          .limit(10)
          .lean();
        for (let post of posts) {
          post.authorName = authorDict[post.author];
          let result = false;
          for (let id of post.likedBy) {
            if (id == currUser.userId) {
              result = true;
              break;
            }
          }
          post.isLiked = result;
        }
        count = await Post.count({
          author: { $in: authorIds },
        });
        res.status(200).json({
          posts,
          count,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/", (req, res, next) => {
  Post.find()
    .exec()
    .then((post) => {
      if (post.length < 1) {
        res.status(401).json({
          message: "user doesnt exist",
        });
      }
      res.status(200).json({
        message: post,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
