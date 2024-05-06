const express = require('express')
const admin = express.Router();
const adminController = require('../controller/adminController/adminController')
const adminCategoryController = require('../controller/adminController/categoryController')
const userManagement=require('../controller/adminController/userManagement')
const productController=require('../controller/adminController/productController')

// checkAdminSession is a middleware that checks session of the admin
const checkAdminSession=require('../middleware/adminSession')






// login
admin.get('/login', adminController.login);
admin.post('/login', adminController.loginPost);


// dashboard
admin.get('/dashboard',checkAdminSession, adminController.dashboard);



// user management
admin.get('/user',checkAdminSession, userManagement.users);
admin.get('/block-user/:id',checkAdminSession, userManagement.blockUser)
admin.get('/unblock-user/:id',checkAdminSession, userManagement.unBlockUser)

// category management
admin.get('/category',checkAdminSession, adminCategoryController.category);
admin.post('/category', adminCategoryController.newCategoryPost)
admin.get('/edit-category/:id', checkAdminSession, adminCategoryController.editCategory)
admin.post('/edit-category/:id', adminCategoryController.editCategoryPost)
admin.get('/hide-category/:id', checkAdminSession, adminCategoryController.hideCategory)
admin.get('/unhide-category/:id', checkAdminSession, adminCategoryController.unHideCategory)
admin.get('/delete-category/:id',checkAdminSession, adminCategoryController.deleteCategory)



// product management
admin.get('/products',checkAdminSession, productController.products);
admin.get('/add-product',checkAdminSession,productController.addProduct)
admin.post('/add-product',productController.multerMiddle,productController.addProductPost)



admin.get('/orders',checkAdminSession, adminController.order);
admin.get('/coupons',checkAdminSession, adminController.coupons);


// logout
admin.get('/logout',checkAdminSession, adminController.logout);

module.exports = admin;