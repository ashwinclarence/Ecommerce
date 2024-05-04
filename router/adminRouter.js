const express = require('express')
const admin = express.Router();
const adminController = require('../controller/adminController/adminController')
const adminCategoryController = require('../controller/adminController/categoryController')
const userManagement=require('../controller/adminController/userManagement')


admin.get('/login', adminController.login);
admin.post('/login', adminController.loginPost);
admin.get('/dashboard', adminController.dashboard);



// user management
admin.get('/user', userManagement.users);
admin.get('/block-user/:id', userManagement.blockUser)
admin.get('/unblock-user/:id', userManagement.unBlockUser)

// category management
admin.get('/category', adminCategoryController.category);
admin.post('/category', adminCategoryController.newCategoryPost)
admin.get('/edit-category/:id', adminCategoryController.editCategory)
admin.post('/edit-category/:id', adminCategoryController.editCategoryPost)
admin.get('/hide-category/:id', adminCategoryController.hideCategory)
admin.get('/unhide-category/:id', adminCategoryController.unHideCategory)
admin.get('/delete-category/:id',adminCategoryController.deleteCategory)



// product management
admin.get('/products', adminController.products);
admin.get('/orders', adminController.order);
admin.get('/coupons', adminController.coupons);
admin.get('/logout', adminController.logout);

module.exports = admin;