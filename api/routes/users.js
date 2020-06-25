const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcrypt");
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
router.post("/signup", async (req, res, next) => {
  try {
    let user = await User.find({ email: req.body.email });
    if (user.length >= 1) {
      return res.status(409).json({
        error: "Username is already in use", // 409 == conflict
      });
    }
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      const user = new User({
        //Create the user
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
        username: "User",
        bio: "Placeholder bio",
        following: [],
        followers: [],
        posts: [],
        userImage: "uploads/defaultUser.png", //default image
      });
      try {
        let result = await user.save();
        const token = jwt.sign({ userId: result._id }, "secret", { expiresIn: "1h" });
        res.cookie("JWT", token, {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //
          httpOnly: false,
        });
        return res.status(201).json({
          message: "login successful",
        });
      } catch (err) {
        return res.status(500).json({
          error: "Please enter a valid Email Address",
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    let user = await User.find({ email: req.body.email });
    if (user.length < 1) {
      return res.status(409).json({
        error: "Invalid email or password", //dont wanna tell them its coz of username coz that would give info to hack
      });
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      if (err) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }
      if (result) {
        const token = jwt.sign({ userId: user[0]._id }, "secret", { expiresIn: "1h" });
        res.cookie("JWT", token, {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //
          httpOnly: false,
        });
        return res.status(201).json({
          message: "login successful",
          userImage: user[0].userImage,
        });
      }
      return res.status(401).json({
        error: "Invalid email or password", //dont wanna tell them its coz of username coz that would give info to hack
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

router.post("/logout", (req, res, next) => {
  res.clearCookie("JWT");
  res.status(200).json({
    message: "success",
  });
});

router.get("/userprofile", async (req, res, next) => {
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
        var user = await User.find({ _id: currUser.userId });
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        var posts = await Post.find({ _id: { $in: user[0].posts } });
        let followerInfo = await User.find({ _id: { $in: user[0].followers } }).select([
          "userImage",
          "username",
        ]);
        let followingInfo = await User.find({ _id: { $in: user[0].following } }).select([
          "userImage",
          "username",
        ]);

        res.status(200).json({
          user: user[0],
          posts: posts.reverse(),
          isUserProfile: true,
          followerInfo: followerInfo,
          followingInfo: followingInfo,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:id", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      error: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          error: "Auth Failed",
        });
      }
      try {
        var user = await User.find({ _id: req.params.id });
        if (user.length < 1) {
          return res.status(404).json({
            error: "user doesnt exist",
          });
        }
        let posts = await Post.find({ _id: { $in: user[0].posts } }).lean();
        posts.forEach((post) => {
          //we have to do it this way because the includes comparison returns false always
          let result = false;
          for (let id of post.likedBy) {
            if (id == currUser.userId) {
              result = true;
              break;
            }
          }
          post.isLiked = result;
        });
        let followerInfo = await User.find({ _id: { $in: user[0].followers } }).select([
          "userImage",
          "username",
        ]);
        console.log(followerInfo);
        let followingInfo = await User.find({ _id: { $in: user[0].following } }).select([
          "userImage",
          "username",
        ]);
        console.log(followingInfo);
        return res.status(200).json({
          user: user[0],
          posts: posts.reverse(),
          isUserProfile: user[0]._id == currUser.userId,
          isFollowing: user[0].followers.includes(currUser.userId),
          followerInfo: followerInfo,
          followingInfo: followingInfo,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/edit", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt.verify(req.cookies.JWT, "secret", async function (err, user) {
    if (!user) {
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    User.find({ _id: user.userId }) //check email first
      .exec()
      .then((user) => {
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist", //dont wanna tell them its coz of username coz that would give info to hack
          });
        }
        const updateOps = {};
        updateOps["username"] = req.body.username;
        updateOps["bio"] = req.body.bio;
        // updateOps["genres"] = req.body.genres //CHANGE THIS TO PICTURE
        User.update({ _id: user[0]._id }, { $set: updateOps }) // if theres no password given
          .exec()
          .then((result) => {
            console.log(result);
            res.status(200).json(result);
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.patch("/editimage", upload.single("userImage"), (req, res, next) => {
  // check header or url parameters or post parameters for token
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt.verify(req.cookies.JWT, "secret", async function (err, user) {
    if (!user) {
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    User.update({ _id: user.userId }, { userImage: req.file.path })
      .exec()
      .then((result) => {
        console.log(result);
        res.status(200).json(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.patch("/follow", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt.verify(req.cookies.JWT, "secret", function (err, currUser) {
    if (!currUser) {
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    User.find({ _id: req.body.id })
      .exec()
      .then(async (user) => {
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        var newfollowers = user[0].followers;
        newfollowers.push(currUser.userId);
        let user1 = await User.find({ _id: currUser.userId }).select([
          "following",
          "userImage",
          "username",
        ]);
        var newfollowing = user1[0].following;
        newfollowing.push(req.body.id);
        let res1 = await User.update(
          { _id: currUser.userId },
          { following: newfollowing }
        );
        User.update({ _id: req.body.id }, { followers: newfollowers })
          .exec()
          .then((result) => {
            res.status(200).json({
              newFollower: user1[0],
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.patch("/unfollow/", async (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed (no cookie)",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed (theres a cookie but jwt expired)",
        });
      }
      try {
        var user = await User.find({ _id: req.body.id }).select(["followers"]);
        if (user.length < 1) {
          res.status(500).json({
            message: "user doesnt exist",
          });
        }
        let newfollowers = user[0].followers;
        newfollowers = newfollowers.filter((follower) => {
          return follower.toString() != currUser.userId.toString();
        });
        let result = await User.update({ _id: req.body.id }, { followers: newfollowers });
        let user1 = await User.find({ _id: currUser.userId }).select(["following"]);
        let newfollowing = user1[0].following;
        newfollowing = newfollowing.filter((following) => {
          return following.toString() != user[0]._id.toString();
        });
        let result1 = await User.update(
          { _id: user1[0]._id },
          { following: newfollowing }
        );
        res.status(200).json({
          message: "success",
          _id: currUser.userId,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      error: "Auth Failed (no cookie)",
    });
  }
  jwt.verify(req.cookies.JWT, "secret", function (err, currUser) {
    if (!currUser) {
      return res.status(401).json({
        error: "Auth Failed (theres a cookie but jwt expired)",
      });
    }
    User.find()
      .exec()
      .then((user) => {
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        res.status(200).json({
          message: user,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.delete("/:userId", (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
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
