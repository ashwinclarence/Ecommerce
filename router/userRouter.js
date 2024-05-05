const express=require('express')
const user=express.Router();
const userController=require('../controller/userController/userController')
const checkUserSession=require('../middleware/userSession')

user.get('/',userController.user)
user.get('/login',userController.login)
user.post('/login',userController.loginPost)
user.get('/home',checkUserSession,userController.home)
user.get('/wishlist',checkUserSession,userController.wishlist)
user.get('/cart',checkUserSession,userController.cart)
user.get('/signup',checkUserSession,userController.signup)
user.post('/signup',userController.signupPost)
// user.get('/forgetPassword',checkUserSession,userController.forgetPassword)
user.get('/otp',checkUserSession,userController.otp)
user.post('/otp',userController.otpPost)
user.get('/resend-otp',checkUserSession,userController.otpResend)


module.exports=user;