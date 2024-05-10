const userSchema = require("../../model/userSchema");
const generateOTP = require('../../services/generateOTP')
const sendOtpMail = require('../../services/emailSender')
const bcrypt = require('bcrypt')


// forget password page render
const forgetPassword = async (req, res) => {
    try {

        res.render('user/forgetPassword', { title: "Forget Password", alertMessage: req.flash('errorMessage'),user:req.session.user })

    } catch (err) {
        console.log(`Error during rendering forget password page ${err}`);
    }
}


// forget password post
const forgetPasswordPost = async (req, res) => {
    try {
        const checkEmail = await userSchema.findOne({ email: req.body.email })

        if(checkEmail.isBlocked){
            req.flash('errorMessage', 'Access to this account has been restricted. Please reach out to the administrator for further assistance and guidance on the next steps."')
            return res.redirect('/user/login')
        }

        // generate otp from services/generateOTP.js file
        const otp = generateOTP();

        // send the mail to the registered user with the OTP
        sendOtpMail(req.body.email, otp)

        // storing the otp and otp generated time in the session
        req.session.email = req.body.email
        req.session.otp = otp;
        req.session.otpExpireTime = Date.now();


        if (checkEmail != "") {
            res.redirect('/user/forget-password-otp')
        } else {
            req.flash('errorMessage', `We couldn't find your user details. Please proceed with registration to access our services.`);
            res.redirect('/user/signup')
        }

    } catch (err) {
        console.log(`Error during forgot password page ${err}`);
    }
}


const forgetPasswordOtp = (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/user/home')
        } else {
            res.render('user/forgetPasswordOTP', { title: "OTP", alertMessage: req.flash('errorMessage'), emailAddress: req.session.email, otpExpireTime: req.session.otpExpireTime,user:req.session.user })
        }
    } catch (err) {
        console.log(`Error during OTP page for forget password page render ${err}`);
    }
}


// check OTP and render new password page
const forgetPasswordOtpPost = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/user/home')
        } else {
            if (req.session.otp !== undefined) {
                if (req.body.otp === req.session.otp) {
                    res.render('user/newPassword', { title: "New Password", alertMessage: req.flash('errorMessage') ,user:req.session.user})
                } else {
                    req.flash('errorMessage', 'Invalid OTP');
                    res.redirect('/user/login')
                }
            } else {
                req.flash('errorMessage', 'An error occurred during OTP validation, please kindly retry.')
                res.redirect('/user/forget-password')
            }
        }

    } catch (err) {
        console.log(`Error during OTP page for forget password page ${err}`);
    }
}


// update the password
const updatePassword = async (req, res) => {
    try {
        if (req.session.email != undefined) {
            if (req.body.password === req.body.confirmPassword) {

                const newPassword = await bcrypt.hash(req.body.password, 10)

                const confirmUpdate = await userSchema.updateOne({ email: req.session.email }, { password: newPassword })


                if (confirmUpdate!='') {
                    req.flash('errorMessage', 'Password Updated Successfully')
                    res.redirect('/user/login')
                } else {
                    req.flash('errorMessage', 'An error occurred during updating password, please kindly retry.')
                    res.redirect('/user/login')
                }
            } else {
                req.flash('errorMessage', 'Password do not match')
                res.redirect('/user/login')

            }
        } else {
            req.flash('errorMessage', 'An error occurred during updating password, please kindly retry.')
            res.redirect('/user/forget-password')
        }

    } catch (err) {
        console.log(`Error while updating the password ${err}`);
    }
}


module.exports = {
    forgetPassword,
    forgetPasswordPost,
    forgetPasswordOtp,
    forgetPasswordOtpPost,
    updatePassword,
}