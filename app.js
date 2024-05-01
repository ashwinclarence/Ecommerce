const express = require('express');
const app = express();
const path = require('path');
// make the variables inside .env file available for process.env
const dotenv = require('dotenv').config();
const session = require('express-session');
// make the layout header for both user and admin
const expressLayouts = require('express-ejs-layouts');
const { v4: uuidv4 } = require('uuid');
const adminRoutes=require('./router/adminRouter')
const userRoutes=require('./router/userRouter')
const connectDB=require('./config/connection')
const port = process.env.PORT || 3000;



// connecting mongodb
connectDB();


// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, 'public', 'style')));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: 'your_secret_here',
    resave: false,
    saveUninitialized: false
}));

// EJS setup
app.use(expressLayouts);
app.set('layout','./layouts/layout')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// First Route
app.get('/', (req, res) => {
    if(req.session.user){
        res.redirect('/user/home')
    }else{
        res.redirect('/user/login');
    }
    // if(req.session.user){
    //     res.render('user/home')
    // }else{
    //     res.render('admin/login',{title:"Admin Login"});
    // }
    
});


// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);



// Port listen 
app.listen(port, (err) => {
    if (err) {
        console.log(`Error occurred during port listen ${err}`);
    } else {
        console.log(`Server running on port http://localhost:${port}`);
    }
});
