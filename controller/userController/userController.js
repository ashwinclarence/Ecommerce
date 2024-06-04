const userSchema = require('../../model/userSchema')
const bcrypt = require('bcrypt')
const sendOtpMail = require('../../services/emailSender')
const generateOTP = require('../../services/generateOTP');
const productSchema = require('../../model/productSchema');
const categorySchema = require('../../model/categorySchema');
const passport = require('passport')
require('../../services/auth')


// user router if session 
const user = (req, res) => {
    try {
        res.redirect('/user/home')
    } catch (err) {
        console.log(`Error during user page routing ${err}`);
    }
}

// signup page render
const signup = (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/user/home')
        } else {
            res.render('user/register', { title: "Signup", alertMessage: req.flash('errorMessage'), user: req.session.user })
        }
    } catch (err) {
        console.log(`Error during signup page render`);
    }

}

// user register with username, email, password and phone number
const signupPost = async (req, res) => {
    try {

        // getting data from input box of the register form
        const registerDetails = {
            username: req.body.name,
            phone: req.body.phone,
            // saved the hashed password using bcrypt
            password: await bcrypt.hash(req.body.password, 10),
            email: req.body.email
        }

        // check the user with same email exist in mongodb
        const userExist = await userSchema.findOne({ email: registerDetails.email })

        // if user with same email id exist then render the register page with error message
        if (userExist) {
            req.flash('errorMessage', 'An account with this email address already exists. Please try using a different email address.')
            res.redirect('/user/signup')
        } else {

            // generate otp from services/generateOTP.js file
            const otp = generateOTP();

            // send the mail to the registered user with the OTP
            sendOtpMail(req.body.email, otp)
            req.flash('errorMessage', `OTP was sended to the ${req.body.email} `)


            // storing otp in the session
            req.session.otp = otp;
            req.session.otpExpireTime = Date.now();

            // storing user data in session
            req.session.email = registerDetails.email
            req.session.password = registerDetails.password
            req.session.name = registerDetails.username
            req.session.phone = registerDetails.phone

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
        res.render('user/login', { title: 'Login', alertMessage: req.flash('errorMessage'), user: req.session.user })
    }
}


// user login with username and password
const loginPost = async (req, res) => {
    try {


        // the username is the email address of the user 
        // find the user with entered email address in user collection
        const checkUser = await userSchema.findOne({ email: req.body.username })
        if (checkUser != null) {
            if (checkUser.isBlocked) {
                req.flash('errorMessage', 'Access to this account has been restricted. Please reach out to the administrator for further assistance and guidance on the next steps.')
                res.redirect('/user/login')
            } else {
                // check the entered password in login form and data stored in user collection is same
                const mongoPassword = await bcrypt.compare(req.body.password, checkUser.password)

                // if the user entered password and password in the collection is same then redirect to home page with session
                if (checkUser && mongoPassword) {
                    req.session.user = checkUser.id //user section is created
                    res.redirect('/user/home')
                } else {
                    req.flash("errorMessage", "Invalid username or password")
                    res.redirect('/user/login')
                }
            }


        } else {
            req.flash("errorMessage", `We couldn't find your user details. Please proceed with registration to access our services.`)
            res.redirect('/user/login')
        }


    } catch (err) {
        console.log(`Error while login ${err}`);
    }

}



// OTP generator page rendering
const otp = (req, res) => {
    try {
        res.render('user/OTP', { title: "OTP verification", emailAddress: req.session.email, alertMessage: req.flash('errorMessage'), otpExpireTime: req.session.otpExpireTime, user: req.session.user })

    } catch (err) {
        console.log(`Error occurred during otp verification ${err}`)
        // res.redirect('/user/signup')
    }
}

const otpPost = async (req, res) => {
    try {

        // if otp is in the session then continue with checking
        if (req.session.otp !== undefined) {
            // user data from session during the registration time
            const registerDetails = {
                name: req.session.name,
                phone: req.session.phone,
                password: req.session.password,
                email: req.session.email,
            }

            // if the user entered otp and otp in session is equal then only the user's data is stored in users collection
            if (req.session.otp === req.body.otp) {
                // adding the user data to mongodb with collection name user
                await userSchema.insertMany(registerDetails).then(() => {
                    console.log('New user registration successful')
                    req.flash('errorMessage', 'user registration successful');
                    res.redirect('/user/login')
                }).catch((err) => {
                    console.log(`Error occurred while user registration ${err}`);
                })
            } else {
                req.flash('errorMessage', 'It appears the OTP you entered is invalid. Please ensure you enter the OTP correctly.')
                res.redirect('/user/OTP')
            }

            // if otp is not in the session an alert message is displayed
        } else {
            req.flash('errorMessage', 'An error occurred during OTP generation, please kindly retry.')
            res.redirect('/user/register')
        }



    } catch (err) {
        console.log(`Error occurred while verifying OTP ${err}`)
    }
}


// resend otp using fetch 
const otpResend = (req, res) => {
    try {

        const emailAddress = req.params.email
        // generate otp from services/generateOTP.js file
        const otp = generateOTP();

        // send the mail to the registered user with the OTP
        sendOtpMail(emailAddress, otp)

        // storing the otp and otp generated time in the session
        req.session.otp = otp;
        req.session.otpExpireTime = Date.now();

        res.status(200)

        // redirect to the otp page for validation
        req.flash('errorMessage', "OTP re-sended successfully")
        res.redirect('/user/otp')


    } catch (err) {
        console.log(`Error during OTP resending ${err}`);
    }

}






// logout the user
const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/user/login')
            }
        })
    } catch (err) {
        console.log(`Error during logout the user`);
    }
}


// google auth 
const googleAuth = (req, res) => {
    try {
        passport.authenticate('google', {
            scope:
            ['email', 'profile']
        })(req,res)
    } catch (err) {
        console.log(`Error on google authentication ${err}`)
    }
}


// google auth callback from the auth service
const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.log(`Error on google auth callback: ${err}`);
        return next(err);
      }
      if (!user) {
        return res.redirect('/user/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Store the user ID in the session
        req.session.user = user.id;
        return res.redirect('/user/home');
      });
    })(req, res, next);
  }





module.exports = {
    user,
    login,
    loginPost,
    signup,
    signupPost,
    otp,
    otpPost,
    otpResend,
    googleAuth,
    googleAuthCallback,
    logout
}