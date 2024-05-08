const express=require('express')
const user=express.Router();
const userController=require('../controller/userController/userController')
const checkUserSession=require('../middleware/userSession')



// login routes
user.get('/',userController.user)
user.get('/login',userController.login)
user.post('/login',userController.loginPost)


// signup routes
user.get('/signup',userController.signup)
user.post('/signup',userController.signupPost)


// otp routes
user.get('/otp',userController.otp)
user.post('/otp',userController.otpPost)
user.get('/resend-otp/:email',userController.otpResend)

// home
user.get('/home',checkUserSession,userController.home)


user.get('/wishlist',checkUserSession,userController.wishlist)
user.get('/cart',checkUserSession,userController.cart)
// user.get('/forgetPassword',checkUserSession,userController.forgetPassword)

// logout
user.get('/logout',checkUserSession,userController.logout)


module.exports=user;