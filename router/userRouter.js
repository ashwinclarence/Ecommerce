const express=require('express')
const user=express.Router();
const checkUserSession=require('../middleware/userSession')
const userController=require('../controller/userController/userController')
const forgetPasswordController=require('../controller/userController/forgetPasswordController')
const productController=require('../controller/userController/productController')


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



// forget password
user.get('/forget-password',forgetPasswordController.forgetPassword);
user.post('/forget-password',forgetPasswordController.forgetPasswordPost);
user.get('/forget-password-otp',forgetPasswordController.forgetPasswordOtp)
user.post('/forget-password-otp',forgetPasswordController.forgetPasswordOtpPost)
user.post('/new-password',forgetPasswordController.updatePassword)




// home
user.get('/home',checkUserSession,userController.home)

// product
user.get('/product-view/:id',checkUserSession,productController.productView)


user.get('/wishlist',checkUserSession,userController.wishlist)
user.get('/cart',checkUserSession,userController.cart)

// logout
user.get('/logout',checkUserSession,userController.logout)


module.exports=user;