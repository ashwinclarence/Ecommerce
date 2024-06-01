const express=require('express')
const user=express.Router();
const checkUserSession=require('../middleware/userSession')
const checkUserBlocked=require('../middleware/userSectionBlocked')
const userController=require('../controller/userController/userController')
const forgetPasswordController=require('../controller/userController/forgetPasswordController')
const productController=require('../controller/userController/productController')
const profileController=require('../controller/userController/profileController')
const orderController=require('../controller/userController/orderController')
const cartController=require('../controller/userController/cartController')
const homeController=require('../controller/userController/homeController')
const checkoutController=require('../controller/userController/checkoutController')


// login routes
user.get('/',userController.user)
user.get('/login',userController.login)
user.post('/login',userController.loginPost)

// login using google
user.get('/auth/google',userController.googleAuth)
user.get('/auth/')
user.get('/auth/facebook',userController.facebookAuth)


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




// home route
// if the user is blocked then the user is redirect to login page
user.get('/home',checkUserBlocked,homeController.home)

// product route
// if the user is blocked then the user is redirect to login page
user.get('/product-view/:id',checkUserBlocked,productController.productView)


// profile route
// if user is blocked in and the session is not there then user is redirect to login page
user.get('/profile',checkUserSession,profileController.profileView)
user.post('/add-address',checkUserSession,profileController.addAddress)
user.get('/edit-address',checkUserSession,profileController.editAddress)
user.post('/edit-address/:id',checkUserSession,profileController.editAddressPost)
user.get('/delete-address/:id',checkUserSession,profileController.deleteAddress)
user.post('/update-profile',checkUserSession,profileController.updateProfile)

// order route
user.get('/orders',checkUserSession,orderController.order)
user.get('/cancelled-orders',checkUserSession,orderController.cancelledOrder)


// wishlist
user.get('/wishlist',checkUserSession,userController.wishlist)


// cart routes
user.get('/cart',checkUserSession,cartController.cart)
user.post('/add-to-cart/:id',checkUserSession,cartController.addToCartPost)
user.post('/cart-count/:id',checkUserSession,cartController.cartCountFetch)
user.delete('/remove-cart-product/:id',checkUserSession,cartController.removeCartItem)



// checkout
user.get('/checkout',checkUserSession,checkoutController.checkout)
user.post('/place-order/:address/:payment',checkUserSession,checkoutController.placeOrder)
user.delete('/delete-address/:id',checkUserSession,checkoutController.deleteAddressFetch)
user.post('/add-address-checkout',checkUserSession,checkoutController.addAddressCheckout)
user.post('/edit-address-checkout/:id',checkUserSession,checkoutController.editAddressCheckout)
// logout
user.get('/logout',userController.logout)


module.exports=user;