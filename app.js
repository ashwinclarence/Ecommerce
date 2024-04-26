const express = require('express');
const app = express();
const path=require('path')
// .env files data are making available in process.env
const dotenv=require('dotenv').config();
const session=require('express-session');

// unique id for session
const { v4: uuidv4 } = require('uuid');



// port number from env file else using port 3000
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}))
// session management
app.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:false
}))

// setting view engine as EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// first route
app.get('/',(req,res) => {
    res.render('admin/adminHome.ejs')
})

// port listen 
app.listen(port, (err) => {
    if(err){
        console.log(`Error occurred durning port listen ${err}`);
    }else{
        console.log(`Server running on port http://localhost:${port}`)
    }
})