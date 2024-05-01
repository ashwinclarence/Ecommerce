const userSchema = require('../model/userSchema')
const bcrypt = require('bcrypt')

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
            res.render('user/register', { title: 'User registration failed', registerError: true, errorMessage: "User already exist. please try with another email address" })
        } else {

            // adding the user data to mongodb with collection name user
            await userSchema.insertMany(registerDetails).then(() => {
                console.log('New user registration successful')
                res.redirect('/')
            }).catch((err) => {
                console.log(`Error occurred while user registration ${err}`);
            })
        }

    } catch (err) {

        console.log(`Error occurred while registering user ${err}`)
    }
}





const login = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.render('user/login', { title: 'User Login', loginError: false })
    }
}

const loginPost = (req, res) => {
    if (req.body.username === 'ashwin@123' && req.body.password === '123') {
        req.session.user = req.body.username
        res.redirect('/user/home')
    } else {
        res.render('user/login', { title: 'User Login', loginError: true, errorMessage: 'Invalid username or password' })
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
const signup = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.render('user/register', { title: "signup", registerError: false })

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