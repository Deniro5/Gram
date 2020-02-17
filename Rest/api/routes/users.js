const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');      //for accepting files ___________________________________________
const storage = multer.diskStorage({
    destination: function(req, file, cb) {    //these functions called when file is accepted. null always goes first there
        cb(null, './uploads/')
    },
    filename: function (req, file ,cb) {
        cb(null, file.originalname)             //whatever we put here is the file name
    }
});
const fileFilter = (req, file, cb) => {   // accept jpg and png reject everything else
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
     cb(null, false);
    }

}
const upload = multer({ 
    storage: storage,
    limits: {                  // only take files over 5mb
        fileSize: 1024*1024 *5 
    },
    fileFilter: fileFilter
})

//___________________________________________________________________________________________
router.post('/test', (req , res , next) => {  //returns all users?
    const user = new User ({   //Create the user 
        _id: new mongoose.Types.ObjectId(),
        email: "placeholder@placeholder.com",
        password: "placeholder",
        username: "Placeholder",
        bio: "Placeholder bio",
        following: [],
        posts: [],
        userImage: "uploads/defaultUser.png"     //default image
    }); 
    user.save()  
    .then(result => {   //Save them and let them sign in here
        res.status(201).json({
            message: "user created",
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })   
});



  router.get('/', (req , res , next) => {  //returns all users?
    User.find()    //check email first
    .exec()
    .then(user => { 
        if (user.length < 1) {
            res.status(401).json({
                message: "user doesnt exist",    
            })
        } 
        res.status(200).json({
            message: user,   
        })
    }) 
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});



router.get('/userfromtoken/:token', (req , res , next) => {
    var token = req.params.token;
    if (!token) {
    return res.status(401).json({message: 'Must pass token'});
    }
// Check token that was passed by decoding token using secret
    jwt.verify(token, "secret", function(err, user) {
    if(!user) {
        res.json({
            user: ""  //there is no user so we return empty string
        })
    }
    User.findOne({_id : user.userId})    //check email first  //get the id of the user so we can get rest of info
    .exec()
    .then(user => { 
        if (user.length < 1) {
            res.status(401).json({
                message: "user doesnt exist",    
            })
        } 
        else {
            res.status(200).json({
                message: user,    
            })
        }
     /*   var count = 0;
        var ids = []
        while (count < user.requests.length) {
            ids.push(mongoose.Types.ObjectId(user.requests[count].id))
            count++
        } */
        /*
        User.find({
            '_id': { $in: ids }
        }) 
        .exec()
        .then(reqData => {
            var count = 0;
            var ids = []

            while (count < user.contacts.length) {
                if (user.contacts[count] != null) {
                    ids.push(mongoose.Types.ObjectId(user.contacts[count]))
                }
                count++
            }

            User.find({
                '_id': { $in: ids }
            }) 
            .exec()
            .then(contactData => {
                res.status(200).json({
                    message: user,
                    reqinfo: reqData,
                    contactInfo: contactData
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            })
           
        }) 
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }) */
        
    }) 
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
})
});


router.get('/:id', (req , res , next) => {
    User.find({_id: req.params.id})    //check email first
    .exec()
    .then(user => { 
        if (user.length < 1) {
            res.status(401).json({
                message: "user doesnt exist",    
            })
        } 
        res.status(200).json({
            message: user,   
        })
    }) 
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});


router.patch('/edit', (req, res, next) => {
    var token = req.body.token;
    if (!token) {
     return res.status(401).json({message: 'Must pass token'});
    }
  // Check token that was passed by decoding token using secret
   jwt.verify(token, "secret", function(err, user) {
     if(!user) {
         res.json({
             user: ""
         })
     }
    User.find({_id: user.userId})    //check email first
    .exec()
    .then(user => { 
        if (user.length < 1) {
            res.status(401).json({
                message: "user doesnt exist",    //dont wanna tell them its coz of username coz that would give info to hack
            })
        } 
        const updateOps = {};
        updateOps["username"] = req.body.username 
        updateOps["bio"] = req.body.bio
       // updateOps["genres"] = req.body.genres //CHANGE THIS TO PICTURE
        User.update({_id: user[0]._id} ,  {$set: updateOps})  // if theres no password given
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        }) 
    }) 
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
})
});

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {     // check if user exists
        if (user.length >= 1) {
            return res.status(409).json({
                message: "Email already in use"         // 409 == conflict       
        });
    }
    else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error:err
                })
            }
            else {
                const user = new User ({   //Create the user 
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash,
                    username: "User",
                    bio: "Placeholder bio",
                    following: [],
                    posts: [],
                    userImage: "uploads/defaultUser.png"     //default image
                }); 
                user.save()
                .then(result => {   //Save them and let them sign in here
                    console.log(result);
                    const token = jwt.sign({                 //create token for valid user
                        email: result.email,
                        userId: result._id,
                        posts: result.posts,
                    }, 
                    "secret",                //key
                    {
                        expiresIn: "1h"
                    }
                    );
                    res.status(201).json({
                        message: "user created",
                        token: token
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                })
            }
        })
    }
    })
     
    });

    router.post('/login', (req, res, next) => {
        User.find({email: req.body.email})    //check email first
        .exec()
        .then(user => { 
            if (user.length < 1) {
                res.status(401).json({
                    message: "Auth Failed",    //dont wanna tell them its coz of username coz that would give info to hack
                    debug: req.body.email + "w"
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth Failed"    //dont wanna tell them its coz of username coz that would give info to hack
                    })
                }
                if (result) {
                    const token = jwt.sign({                 //create token for valid user
                        email: user[0].email,
                        posts: user[0].posts,
                        userId: user[0]._id
                    }, 
                    "secret",                //key
                    {
                        expiresIn: "1h"
                    }
                );
                    return res.status(200).json({           //if valid login, giv tokentoken
                        message: "Auth successful",
                        token: token
                    });
                }
                res.status(401).json({
                    message: "Auth Failed"    //dont wanna tell them its coz of username coz that would give info to hack
                })

            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
    });

    router.patch('/editimage', upload.single('userImage'), (req, res, next) => {
        // check header or url parameters or post parameters for token
        var token = req.body.token;
        if (!token) {
           return res.status(401).json({message: 'Must pass token'});
        }
        // Check token that was passed by decoding token using secret
        jwt.verify(token, "secret", function(err, user) {
           //return user using the id from w/in JWTToken
           if(!user) {
               res.json({
                   user: ""
               })
           }
        User.update({_id: user.userId} , {userImage : req.file.path})
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
    })
    });

    router.patch('/addimage', upload.single('userImage'), (req, res, next) => {
        // check header or url parameters or post parameters for token
        var token = req.body.token;
        if (!token) {
           return res.status(401).json({message: 'Must pass token'});
        }
        // Check token that was passed by decoding token using secret
        jwt.verify(token, "secret", function(err, user) {
           //return user using the id from w/in JWTToken
           if(!user) {
               res.json({
                   user: ""
               })
           }
        //We gotta get the user array of pics and then add this one along with the file name / date / caption.
        //This should be added to the front of the array
        User.update({_id: user.userId} , {$push: {posts: {id: req.body.id, path: req.file.path, date: req.body.date, likes: [], comments: []}}})
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
    })
    });
    router.patch('/dimage',  (req, res, next) => {
        // check header or url parameters or post parameters for token
        var token = req.body.token;
        if (!token) {
           return res.status(401).json({message: 'Must pass token'});
        }
        // Check token that was passed by decoding token using secret
        jwt.verify(token, "secret", function(err, user) {
           //return user using the id from w/in JWTToken
           if(!user) {
               res.json({
                   user: ""
               })
           }
           console.log(user)
           var count = 0;
           var newposts = req.body.posts
           while (count < newposts.length) {
               if(newposts[count].id == req.body.id) {
                    console.log(newposts[count].id) 
                    newposts.splice(count,1)
                    break;
               }
               count++;
           }
        //We gotta get the user array of pics and then add this one along with the file name / date / caption.
        //This should be added to the front of the array
        User.update({_id: user.userId} , {posts: newposts})
        .exec()
        .then(result =>{
            console.log(newposts);
            res.status(200).json({
                newposts: newposts
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
    })
    });

    router.patch('/like',  (req, res, next) => {
        /**/
        // check header or url parameters or post parameters for token
        var token = req.body.token;
        if (!token) {
           return res.status(401).json({message: 'Must pass token'});
        }
        // Check token that was passed by decoding token using secret
        jwt.verify(token, "secret", function(err, user) {
           //return user using the id from w/in JWTToken
           if(!user) {
               res.json({
                   user: ""
               })
           }
           User.find({_id: req.body.id})    //check email first
           .exec()
           .then(user1 => { 
               if (user1.length < 1) {
                   res.status(401).json({
                       message: "user doesnt exist",    
                   })
               } 
               var count = 0;
               var oldposts = user1[0].posts;
               while (count < user1[0].posts.length) {
                   if (user1[0].posts[count].id === req.body.picid) {
                       oldposts[count].likes.push(user.userId)
                       break;
                   }
                   count++;
               }
               User.update({_id: req.body.id} , {posts: oldposts})
                .exec()
                .then(result =>{
                    res.status(200).json({
                        oldposts: oldposts
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error:err
                    })
                })
           }) 
           .catch(err => {
               console.log(err);
               res.status(500).json({
                   error: err
               });
           })
           
        //We gotta get the user array of pics and then add this one along with the file name / date / caption.
        //This should be added to the front of the array
    })
    });

    router.patch('/comment',  (req, res, next) => {
        /**/
        // check header or url parameters or post parameters for token

        var token = req.body.token;
        if (!token) {
           return res.status(401).json({message: 'Must pass token'});
        }
        // Check token that was passed by decoding token using secret
        jwt.verify(token, "secret", function(err, user) {
           //return user using the id from w/in JWTToken
           if(!user) {
               res.json({
                   user: ""
               })
           }
           User.find({_id: req.body.id})    //check email first
           .exec()
           .then(user1 => { 
               if (user1.length < 1) {
                   res.status(401).json({
                       message: "user doesnt exist",    
                   })
               } 
               var count = 0;
               var oldposts = user1[0].posts;
               while (count < user1[0].posts.length) {
                   if (user1[0].posts[count].id === req.body.picid) {
                       oldposts[count].comments.push({id: user.userId, username: req.body.username, content: req.body.content})
                       break;
                   }
                   count++;
               }
               User.update({_id: req.body.id} , {posts: oldposts})
                .exec()
                .then(result =>{
                    res.status(200).json({
                        oldposts: oldposts,
                        newModalPostComments: oldposts[count].comments
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error:err
                    })
                })
           }) 
           .catch(err => {
               console.log(err);
               res.status(500).json({
                   error: err
               });
           })
           
        //We gotta get the user array of pics and then add this one along with the file name / date / caption.
        //This should be added to the front of the array
    })
    });

    router.patch('/follow',  (req, res, next) => {
        /**/
        // check header or url parameters or post parameters for token
        var token = req.body.token;
        if (!token) {
           return res.status(401).json({message: 'Must pass token'});
        }
        // Check token that was passed by decoding token using secret
        jwt.verify(token, "secret", function(err, user) {
           //return user using the id from w/in JWTToken
           if(!user) {
               res.json({
                   user: ""
               })
           }
           User.find({_id: req.body.id})    //check email first
           .exec()
           .then(user1 => { 
               if (user1.length < 1) {
                   res.status(401).json({
                       message: "user doesnt exist",    
                   })
               } 
               var newfollowing = user1[0].following
               newfollowing.push(user.userId)
               User.update({_id: req.body.id} ,  {following : newfollowing })
                .exec()
                .then(result =>{
                    res.status(200).json({
                        newfollowing: newfollowing
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error:err
                    })
                })
           }) 
           .catch(err => {
               console.log(err);
               res.status(500).json({
                   error: err
               });
           })
           
        //We gotta get the user array of pics and then add this one along with the file name / date / caption.
        //This should be added to the front of the array
    })
    });


    router.get('/me/from/token/:token', function(req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.params.token;
        if (!token) {
         return res.status(401).json({message: 'Must pass token'});
        }
      // Check token that was passed by decoding token using secret
       jwt.verify(token, "secret", function(err, user) {
         //return user using the id from w/in JWTToken
         if(!user) {
             res.json({
                 user: ""
             })
         }
          User.findById({
          '_id': user.userId
          }, function(err, user) {
               //Note: you can renew token by creating new token(i.e.    
               //refresh it)w/ new expiration time at this point, but I’m 
               //passing the old token back.
               // var token = utils.generateToken(user);
              res.json({
                  user: user,  //return both user and token
                  token: token
              });
           });
        });
      });

    router.delete('/:userId', (req, res, next) => {
        User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            })
        }) 
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
    });

    router.delete('/:userId', (req, res, next) => {
        User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            })
        }) 
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
    });


module.exports = router;