const express = require('express');
const app = express();
const path = require('path');
// make the variables inside .env file available for process.env
const dotenv = require('dotenv').config();
const session = require('express-session');
// make the layout header for both user and admin
const expressLayouts = require('express-ejs-layouts');
const { v4: uuidv4 } = require('uuid');

// admin and user routers
const adminRoutes=require('./router/adminRouter')
const userRoutes=require('./router/userRouter')

// mongodb required connection
const connectDB=require('./config/connection')

// cookie-parser
const cookieParser=require('cookie-parser')

// nocache
const nocache=require('nocache')

// flash message
const flash=require('connect-flash')


// if port number from .env file is not read then 3000 is used as the default port
const port = process.env.PORT || 3000;


// cookieParser
app.use(cookieParser())

// connecting mongodb
connectDB();

// nocache
app.use(nocache())

// flash message 
app.use(flash())

// made the uploads file static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, 'public', 'style')));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: uuidv4(),
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

    // if(req.session && req.session.admin){
    //     res.redirect('/admin/dashboard')
    // }else{
    //     if(req.session.user){
    //         res.redirect('/user/home')
    //     }else{
    //         res.redirect('/user/login');
    //     }
    // }
    res.redirect('/user/home')
});


// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// page to render for those un-described routes
app.get("*",(req,res)=>{
    res.render('pageNotFound',{title:"404 Page not found"})
})


// Port listen 
app.listen(port, (err) => {
    if (err) {
        console.log(`Error occurred during port listen ${err}`);
    } else {
        console.log(`Server running on port http://localhost:${port}`);
    }
});
