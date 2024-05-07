const userSchema = require('../../model/userSchema')
const bcrypt = require('bcrypt')
const sendOtpMail = require('../../services/emailSender')
const generateOTP = require('../../services/generateOTP');
const productSchema = require('../../model/productSchema');
const categorySchema = require('../../model/categorySchema');


const user = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.redirect('/user/login')
    }
}



// signup page render
const signup = (req, res) => {
    if (req.session.user) {
        res.redirect('/user/home')
    } else {
        res.render('user/register', { title: "Signup", alertMessage: "" })
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
            // storing user data in session
            req.session.email = registerDetails.email
            req.session.password = registerDetails.password
            req.session.name = registerDetails.name
            req.session.phone = registerDetails.phone

            // generate otp from services/generateOTP.js file
            const otp = generateOTP();

            // send the mail to the registered user with the OTP
            sendOtpMail(req.session.email, otp)

            // storing the otp and email address in the session
            req.session.otp = otp;

            // redirect to the otp page for validation
            res.redirect('/user/otp')

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
        if (checkUser != null) {

            // check the entered password in login form and data stored in user collection is same
            const mongoPassword = await bcrypt.compare(req.body.password, checkUser.password)

            if (checkUser && mongoPassword) {
                req.session.user = req.body.username //user section is created
                res.redirect('/user/home')
            } else {
                res.render('user/login', { title: 'Login', alertMessage: "Invalid username or password" })
            }
        } else {
            res.render('user/login', { title: 'Login', alertMessage: "Invalid username or password" })
        }


    } catch (err) {
        console.log(`Error while login ${err}`);
    }

}



// OTP generator page rendering
const otp = (req, res) => {
    try {
        res.render('user/OTP', { title: "OTP verification", emailAddress: req.session.email })

    } catch (err) {
        console.log(`Error occurred during otp verification ${err}`)
    }
}

const otpPost = async (req, res) => {
    try {

        // if otp is in the session then only data 
        if (req.session.otp !== undefined) {
            // user data from session during the registration time
            const registerDetails = {
                name: req.session.name,
                phone: req.session.phone,
                password: req.session.password,
                email: req.session.email,
                isBlocked: false
            }
            // if the user entered otp and otp in session is equal then only the user's data is stored in users collection
            if (req.session.otp === req.body.otp) {
                console.log("inside if ", req.cookies.otp)
                // adding the user data to mongodb with collection name user
                await userSchema.insertMany(registerDetails).then(() => {
                    console.log('New user registration successful')
                    res.render('user/login', { title: 'Login', alertMessage: "User registration is Successful" })
                }).catch((err) => {
                    console.log(`Error occurred while user registration ${err}`);
                })
            } else {
                res.render('user/OTP', { title: "OTP verification", alertMessage: "It appears the OTP you entered is invalid. Please ensure you enter the OTP correctly.", emailAddress: req.session.email })
            }

            // if otp is not in the session an alert message is displayed
        } else {
            res.render('user/register', { title: "Signup", alertMessage: "An error occurred during OTP generation, please kindly retry." })
        }



    } catch (err) {
        console.log(`Error occurred while verifying OTP ${err}`)
    }
}


// resend otp 
const otpResend = (req, res) => {
    try {
        // generate otp from services/generateOTP.js file
        const otp = generateOTP();

        // send the mail to the registered user with the OTP
        sendOtpMail(req.session.email, otp)

        // storing the otp and email address in the session
        req.session.otp = otp;

        // redirect to the otp page for validation
        res.redirect('/user/otp')

    } catch (err) {
        console.log(`Error during OTP resending ${err}`);
    }

}







const home = async (req, res) => {

    const products = await productSchema.find({isActive:true})
    const category = await categorySchema.find({isActive:true})

    res.render('user/home', { title: 'User Home', products, category })

}




const wishlist = (req, res) => {

    res.render('user/wishlist', { title: "Wishlist" })

}
const cart = (req, res) => {

    res.render('user/cart', { title: "cart" })

}





module.exports = {
    user,
    login,
    loginPost,
    home,
    wishlist,
    cart,
    signup,
    otp,
    signupPost,
    otpPost,
    otpResend,
}