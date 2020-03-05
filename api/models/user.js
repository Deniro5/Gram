const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
    email: {type: String, 
        required: true ,  
        //Ensures that the email matches this pattern
        match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },     
        password: {type: String, require: true},
        bio: {type: String},
        username: {type: String, require: true},
        following: [],
        posts: [{}],
        userImage: {type : String, required: true}                       
});

module.exports = mongoose.model('User', userSchema);