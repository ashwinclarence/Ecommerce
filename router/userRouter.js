const express=require('express')
const user=express.Router();
const userController=require('../controller/userController')

user.get('/login',userController.login)
user.post('/login',userController.loginPost)
user.get('/home',userController.home)
user.get('/wishlist',userController.wishlist)
user.get('/cart',userController.cart)
user.get('/signup',userController.signup)
user.post('/signup',userController.signupPost)
// user.get('/forgetPassword',userController.forgetPassword)
user.get('/otp',userController.otp)
user.post('/otp',userController.otpPost)
user.get('/resend-otp',userController.otpResend)

module.exports=user;