const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./api/routes/users');

mongoose.connect("mongodb+srv://TEST:TEST@cluster0-24ap0.mongodb.net/test?retryWrites=true&w=majority" , {
    useMongoClient: true
});  //gotta get the new key


app.use(morgan('dev'));   //allows for logging requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next) => {      //Prevents CORS errors
    res.header('Access-Control-Allow-Origin', '*')      // clients we support (heres where we can prevent access from unwanted webpages)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')      //headers we support
    if (req.method === 'OPTIONS') {// requests we support
        res.header("Access-Control-Allow-Methods" , 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

app.use('/users', userRoutes)
app.use( '/uploads',express.static('uploads'));      // allows access to the uploads folder on localhost


//Handling errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status(404);
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

//--------------------------------

module.exports = app;