const express=require('express')
const admin=express.Router();
const adminController=require('../controller/adminController')


admin.get('/login',adminController.login);
admin.post('/login',adminController.loginPost);
admin.get('/dashboard',adminController.dashboard);
admin.get('/category',adminController.category);
admin.post('/category',adminController.newCategoryPost)
admin.get('/products',adminController.products);
admin.get('/user',adminController.users);
admin.get('/orders',adminController.order);
admin.get('/coupons',adminController.coupons);
admin.get('/logout',adminController.logout);
admin.get('/block-user/:id',adminController.blockUser)
admin.get('/unblock-user/:id',adminController.unBlockUser)
admin.get('/edit-category/:id',adminController.editCategory)

module.exports=admin;