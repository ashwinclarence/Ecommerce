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
const wishlistController=require('../controller/userController/wishlistController')

// login routes
user.get('/',userController.user)
user.get('/login',userController.login)
user.post('/login',userController.loginPost)

// login using google
user.get('/auth/google',userController.googleAuth)
user.get('/auth/google/callback',userController.googleAuthCallback)


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
user.post('/edit-address-profile/:id',checkUserSession,profileController.editAddressPost)
user.post('/update-profile',checkUserSession,profileController.updateProfile)

// order route
user.get('/orders',checkUserSession,orderController.order)
user.get('/cancelled-orders',checkUserSession,orderController.cancelledOrder)
user.post('/cancel-order/:orderID',checkUserSession,orderController.cancelledOrderPost)
user.post('/return-order/:orderID',checkUserSession,orderController.returnOrderPost)
user.post('/add-review/:productID',checkUserSession,orderController.addReview)

// wallet
user.get('/wallet',checkUserSession,orderController.walletRender)

// wishlist
user.get('/wishlist',checkUserSession,wishlistController.wishlist)
user.get('/add-wishlist/:id',checkUserSession,wishlistController.addWishlist)
user.get('/remove-wishlist/:id',checkUserSession,wishlistController.removeWishlist)


// cart routes
user.get('/cart',checkUserSession,cartController.cart)
user.post('/add-to-cart/:id',checkUserSession,cartController.addToCartPost)
user.post('/cart-count/:id',checkUserSession,cartController.cartCountFetch)
user.delete('/remove-cart-product/:id',checkUserSession,cartController.removeCartItem)
user.put('/increment-product/:productID',checkUserSession,cartController.incrementProduct)
user.put('/decrement-product/:productID',checkUserSession,cartController.decrementProduct)

// coupon in cart
user.get('/get-coupon/:couponID',checkUserSession,cartController.getCoupon)
user.post('/apply-coupon/:couponID',checkUserSession,cartController.applyCoupon)
user.delete('/remove-coupon',checkUserSession,cartController.removeCoupon)
user.get('/proceed-checkout',checkUserSession,cartController.proceedCheckout)


// checkout
user.get('/checkout',checkUserSession,checkoutController.checkout)
user.post('/place-order/:address/:payment',checkUserSession,checkoutController.placeOrder)
user.post('/payment-render/:amount',checkUserSession,checkoutController.paymentRender)
user.delete('/delete-address/:id',checkUserSession,checkoutController.deleteAddressFetch)
user.post('/add-address-checkout',checkUserSession,checkoutController.addAddressCheckout)
user.post('/edit-address-checkout/:id',checkUserSession,checkoutController.editAddressCheckout)
user.get('/confirm-order',checkUserSession,checkoutController.orderConfirmPage)




// logout
user.get('/logout',userController.logout)


module.exports=user;