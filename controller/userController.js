const userSchema = require('../model/userSchema')
const bcrypt = require('bcrypt')


// signup page render
const signup = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.render('user/register', { title: "Signup", alertMessage:"" })

    }
}



// user register with username, email, password and phone number
const signupPost = async (req, res) => {
    try {
        // getting data from input box of the register form
        const registerDetails = {
            name: req.body.name,
            phone: req.body.phone,
            // saved the hashed password using bcrypt
            password: await bcrypt.hash(req.body.password, 10),
            email: req.body.email
        }

        // check the user with same email exist in mongodb
        const userExist = await userSchema.findOne({ email: registerDetails.email })

        // if user with same email id exist then render the register page with error message
        if (userExist) {
            res.render('user/register', { title: 'Signup', alertMessage: "An account with this email address already exists. Please try using a different email address." })
        } else {

            // adding the user data to mongodb with collection name user
            await userSchema.insertMany(registerDetails).then(() => {
                console.log('New user registration successful')
                res.render('user/login', { title: 'Login', alertMessage: "User registration is Successful" })
            }).catch((err) => {
                console.log(`Error occurred while user registration ${err}`);
            })
        }

    } catch (err) {

        console.log(`Error occurred while registering user ${err}`)
    }
}




// render the login page 

const login = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.render('user/login', { title: 'Login', alertMessage: "" })
    }
}


// user login with username and password
const loginPost = async (req, res) => {
    try {

        // find the user with entered email address in user collection
        const checkUser = await userSchema.findOne({ email: req.body.username })
        if(checkUser!=null){

            // check the entered password in login form and data stored in user collection is same
            const mongoPassword = await bcrypt.compare(req.body.password,checkUser.password)
        
            if (checkUser && mongoPassword) {
                req.session.user = req.body.username //user section is created
                res.redirect('/user/home')
            } else {
                res.render('user/login', { title: 'Login', alertMessage: "Invalid username or password" })
            }
        }else{
            res.render('user/login',{ title: 'Login', alertMessage: "Invalid username or password" })
        }

       
    } catch (err) {
        console.log(`Error while login ${err}`);
    }

}


const home = (req, res) => {
    if (req.session.user) {
        res.render('user/home', { title: 'User Home' })
    } else {
        res.redirect('/user/login')
    }
}
const wishlist = (req, res) => {
    if (req.session.user) {
        res.render('user/wishlist', { title: "Wishlist" })
    } else {
        res.redirect('/user/login')
    }
}
const cart = (req, res) => {
    if (req.session.user) {
        res.render('user/cart', { title: "cart" })
    } else {
        res.redirect('/user/login')
    }
}

const forgetPassword = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.render('user/forgetPassword', { title: "OTP verification" })

    }
}



module.exports = { login, loginPost, home, wishlist, cart, signup, forgetPassword, signupPost }