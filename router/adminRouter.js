const express = require('express')
const admin = express.Router();
const adminController = require('../controller/adminController/adminController')
const adminCategoryController = require('../controller/adminController/categoryController')
const userManagement=require('../controller/adminController/userManagement')
const productController=require('../controller/adminController/productController')
const orderController=require('../controller/adminController/orderController')
const couponController=require('../controller/adminController/couponController')
const trendingController=require('../controller/adminController/trendingController')
const offerController=require('../controller/adminController/offerController')
// checkAdminSession is a middleware that checks session of the admin
const checkAdminSession=require('../middleware/adminSession')
const upload=require('../middleware/multer')


// login
admin.get('/', adminController.admin);
admin.get('/login', adminController.login);
admin.post('/login', adminController.loginPost);


// dashboard
admin.get('/dashboard',checkAdminSession, adminController.dashboard);
admin.post('/custom-sales',checkAdminSession, adminController.generateCustomSales)
admin.post('/pdf-report',checkAdminSession, adminController.downloadPdfReport)
admin.post('/excel-report',checkAdminSession, adminController.downloadExcelReport)

// trending 
admin.get('/trending',checkAdminSession,trendingController.trendRender)


// user management
admin.get('/user',checkAdminSession, userManagement.users);
admin.get('/block-user/:id',checkAdminSession, userManagement.blockUser)
admin.get('/unblock-user/:id',checkAdminSession, userManagement.unBlockUser)

// category management
admin.get('/category',checkAdminSession, adminCategoryController.category);
admin.post('/category',checkAdminSession, adminCategoryController.newCategoryPost)
admin.get('/edit-category/:id', checkAdminSession, adminCategoryController.editCategory)
admin.post('/edit-category/:id', adminCategoryController.editCategoryPost)
admin.get('/hide-category/:id', checkAdminSession, adminCategoryController.hideCategory)
admin.get('/unhide-category/:id', checkAdminSession, adminCategoryController.unHideCategory)
admin.get('/delete-category/:id',checkAdminSession, adminCategoryController.deleteCategory)



// product management
admin.get('/products',checkAdminSession, productController.products);
admin.get('/add-product',checkAdminSession,productController.addProduct)
admin.post('/add-product',upload.array('productImage',4),productController.addProductPost)
admin.get('/edit-product/:id',checkAdminSession,productController.editProduct)
admin.post('/edit-product/:id',upload.array("productImage", 4),productController.editProductPost)
admin.get('/product-inactive/:id',checkAdminSession,productController.productInactive)
admin.get('/product-active/:id',checkAdminSession,productController.productActive)
admin.delete('/delete-product/:id',checkAdminSession,productController.productDelete)


// order management 
admin.get('/orders',checkAdminSession, orderController.order);
admin.get('/view-order/:orderID',checkAdminSession,orderController.viewOrder)
admin.post('/edit-order-status/:orderID',checkAdminSession,orderController.editOrder)

// coupon
admin.get('/coupons',checkAdminSession, couponController.coupons);
admin.post('/add-coupon',checkAdminSession, couponController.addCoupon);
admin.post('/edit-coupon/:id',checkAdminSession, couponController.editCoupon);
admin.put('/block-coupon/:id',checkAdminSession, couponController.blockCoupon);
admin.put('/unblock-coupon/:id',checkAdminSession, couponController.unBlockCoupon);
admin.delete('/delete-coupon/:id',checkAdminSession, couponController.deleteCoupon);

// offer
admin.get('/offer',checkAdminSession,offerController.offerRender)
admin.post('/add-offer',checkAdminSession,offerController.addOfferPost)
admin.delete('/delete-offer/:offerID',checkAdminSession,offerController.deleteOffer)
admin.post('/check-category-offer/:categoryID',checkAdminSession,offerController.offerCheckCategory)
admin.post('/check-product-offer/:productID',checkAdminSession,offerController.offerCheckProduct)
admin.post('/edit-offer/:offerID',checkAdminSession,offerController.editOffer)
admin.post('/getOffer-details/:offerID',checkAdminSession,offerController.getOfferDetails)


// logout
admin.get('/logout',checkAdminSession, adminController.logout);

module.exports = admin;